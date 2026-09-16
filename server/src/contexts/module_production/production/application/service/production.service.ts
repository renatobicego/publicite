import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';
import { Production } from '../../domain/entity/production.entity';
import {
  ProductionArticle,
  ProductionFile,
  ProductionFolder,
  ProductionItem,
} from '../../domain/entity/production-item.entity';
import {
  ProductionItemKind,
  ProductionOwnerType,
  ProductionRole,
} from '../../domain/entity/enum/production.enums';
import {
  ProductionCreateRequest,
  ProductionUpdateRequest,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/production.request';
import {
  ProductionArticleRequest,
  ProductionArticleUpdateRequest,
  ProductionFileRequest,
  ProductionFileUpdateRequest,
  ProductionFolderRequest,
  ProductionFolderUpdateRequest,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/production-item.request';
import {
  ProductionIdResponse,
  ProductionItemResponse,
  ProductionItemsResponse,
  ProductionLimitsResponse,
  ProductionListResponse,
  ProductionResponse,
} from '../../domain/entity/models_graphql/HTTP-RESPONSE/production.response';
import { ProductionRepositoryInterface } from '../../domain/repository/production.repository.interface';
import { ProductionItemRepositoryInterface } from '../../domain/repository/production-item.repository.interface';
import { ProductionServiceInterface } from '../../domain/service/production.service.interface';
import { ProductionFactory } from '../production-factory/production.factory';
import { ProductionAccessService } from './production.access.service';
import {
  AccessDecision,
  evaluateItemAccess,
  resolveEffectiveVisibility,
  ProductionViewerContext,
  TicketRef,
} from '../functions/production.access';
import { toItemResponse, toProductionResponse } from '../functions/production.view';
import {
  buildProductionSearchRegex,
  normalizeFileName,
  requireNonEmpty,
  toSearchText,
} from '../functions/production.text';
import { ProductionCascadeService } from './production.cascade.service';
import { ProductionViewerScope } from './production.access.service';
import { hashAccessKey } from '../functions/production.access-key';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

const DUPLICATE_KEY = 11000;
const MAX_URL_ATTEMPTS = 3;
const MAX_OWNER_PRODUCTIONS = 100;
const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 10;

const normalizePagination = (page: number, limit: number) => ({
  safePage: Math.max(1, Math.floor(page) || 1),
  safeLimit: Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(limit) || DEFAULT_PAGE_SIZE),
  ),
});

const isDuplicateKeyError = (error: any, field?: string) =>
  error?.code === DUPLICATE_KEY &&
  (!field || JSON.stringify(error?.keyPattern ?? {}).includes(field));

@Injectable()
export class ProductionService implements ProductionServiceInterface {
  private readonly factory = ProductionFactory.getInstance();

  constructor(
    private readonly logger: MyLoggerService,
    @InjectConnection() private readonly connection: Connection,
    @Inject('ProductionRepositoryInterface')
    private readonly productionRepository: ProductionRepositoryInterface,
    @Inject('ProductionItemRepositoryInterface')
    private readonly itemRepository: ProductionItemRepositoryInterface,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
    private readonly accessService: ProductionAccessService,
    private readonly cascadeService: ProductionCascadeService,
  ) {}

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async inTransaction<T>(
    work: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    const session = await this.connection.startSession();
    try {
      let result: T;
      await session.withTransaction(async () => {
        result = await work(session);
      });
      return result!;
    } finally {
      await session.endSession();
    }
  }

  private async getProductionOrFail(
    productionId: string,
    session?: ClientSession,
  ): Promise<Production> {
    const production = await this.productionRepository.findById(
      productionId,
      session,
    );
    if (!production) throw new NotFoundException('Producción no encontrada');
    return production;
  }

  private async getItemOrFail(
    itemId: string,
    kind?: ProductionItemKind,
    session?: ClientSession,
  ): Promise<ProductionItem> {
    const item = await this.itemRepository.findById(itemId, session);
    if (!item || (kind && item.getKind !== kind)) {
      throw new NotFoundException('Elemento no encontrado');
    }
    return item;
  }

  /** La carpeta padre tiene que existir, ser carpeta y ser del mismo blog. */
  private async assertValidParent(
    productionId: string,
    parentId: string | undefined | null,
    session?: ClientSession,
  ): Promise<void> {
    if (!parentId) return;
    const parent = await this.itemRepository.findById(parentId, session);
    if (
      !parent ||
      parent.getKind !== ProductionItemKind.folder ||
      parent.getProduction !== productionId
    ) {
      throw new BadRequestException('La carpeta de destino no es válida');
    }
  }

  /** ID `fileName` único en el contenedor; si no viene, se genera (BLG-13). */
  private async resolveFileName(
    productionId: string,
    parentId: string | null,
    requested: string | undefined,
    prefix: string,
    session: ClientSession,
    excludeId?: string,
  ): Promise<string> {
    if (requested !== undefined && requested !== null) {
      const fileName = normalizeFileName(requested);
      const exists = await this.itemRepository.existsFileName(
        productionId,
        parentId,
        fileName,
        excludeId,
        session,
      );
      if (exists) {
        throw new BadRequestException(
          `Ya existe un elemento con el ID "${fileName}" en esta carpeta`,
        );
      }
      return fileName;
    }

    let next =
      (await this.itemRepository.countByContainer(
        productionId,
        parentId,
        session,
      )) + 1;
    for (;;) {
      const candidate = `${prefix}-${next}`;
      const exists = await this.itemRepository.existsFileName(
        productionId,
        parentId,
        candidate,
        excludeId,
        session,
      );
      if (!exists) return candidate;
      next++;
    }
  }

  /**
   * Reserva un lugar en el cupo de archivos del blog (PLN-05, SB-04). El límite
   * es el del plan del creator (GRP-08). Se valida ANTES de persistir.
   */
  private async reserveFileSlot(
    production: Production,
    session: ClientSession,
  ): Promise<void> {
    const { filesPerBlogLimit } = await this.accessService.getCreatorLimits(
      production,
      session,
    );
    const reserved = await this.productionRepository.tryIncrementFilesCount(
      production.getId!,
      filesPerBlogLimit,
      session,
    );
    if (!reserved) {
      throw new BadRequestException(
        `Alcanzaste el límite de ${filesPerBlogLimit} archivos de este blog según tu plan. Mejorá tu plan o comprá un pack para subir más.`,
      );
    }
  }

  private async buildItemView(
    production: Production,
    item: ProductionItem,
    role: ProductionRole,
  ): Promise<ProductionItemResponse> {
    const ancestors = await this.itemRepository.findAncestors(item.getId!);
    const chain = [item, ...ancestors];
    return toItemResponse(item, {
      role,
      decision: { listed: true, canViewContent: true },
      effectiveVisibility: resolveEffectiveVisibility(
        chain.map((node) => node.getVisibility),
        production.getVisibility,
      ),
    });
  }

  private mapShelf(request: { shelf?: any[] }) {
    return request.shelf?.map(({ category, title, link, imageKey }) => ({
      category,
      title: title.trim(),
      link,
      imageKey,
    }));
  }

  // ---------------------------------------------------------------------------
  // Blog
  // ---------------------------------------------------------------------------

  async createProduction(
    request: ProductionCreateRequest,
    userId: string,
  ): Promise<ProductionIdResponse> {
    this.logger.log('Creating production for user: ' + userId);

    let ownerId = userId;
    let ownerType = ProductionOwnerType.User;

    if (request.groupId) {
      const group = await this.productionRepository.findGroupRoster(
        request.groupId,
      );
      if (!group) throw new NotFoundException('Grupo no encontrado');
      // GRP-02/03: sólo el creator del grupo crea su blog.
      if (group.creator?.toString() !== userId) {
        throw new BadRequestException(
          'Sólo el creador del grupo puede crear el blog del grupo',
        );
      }
      ownerId = request.groupId;
      ownerType = ProductionOwnerType.Group;
    }

    for (let attempt = 1; ; attempt++) {
      try {
        const productionId = await this.inTransaction(async (session) => {
          // PLN-04: se valida el cupo del plan antes de persistir. El blog de
          // grupo se descuenta del plan del creator (RNF-14).
          const allowed = await this.userService.isThisUserAllowedToCreateBlog(
            userId,
            ownerType,
            session,
          );
          if (!allowed) {
            throw new BadRequestException(
              ownerType === ProductionOwnerType.Group
                ? 'Alcanzaste el límite de blogs de grupo de tu plan. Mejorá tu plan para crear más.'
                : 'Ya tenés tu blog personal. Tu plan permite un único blog personal.',
            );
          }

          const production = this.factory.createProduction(request, {
            ownerId,
            ownerType,
            creatorId: userId,
          });
          const id = await this.productionRepository.create(production, session);
          await this.userService.saveNewProductionInUser(id, userId, {
            session,
          });
          if (ownerType === ProductionOwnerType.Group) {
            await this.productionRepository.setGroupBlog(ownerId, id, session);
          }
          return id;
        });
        return { _id: productionId };
      } catch (error: any) {
        if (isDuplicateKeyError(error, 'url') && attempt < MAX_URL_ATTEMPTS) {
          this.logger.warn('URL de producción repetida, reintentando');
          continue;
        }
        if (isDuplicateKeyError(error, 'owner')) {
          throw new BadRequestException('Este grupo ya tiene un blog');
        }
        throw error;
      }
    }
  }

  async updateProduction(
    productionId: string,
    request: ProductionUpdateRequest,
    userId: string,
  ): Promise<ProductionResponse> {
    const production = await this.getProductionOrFail(productionId);
    const role = await this.accessService.assertPermission(
      production,
      userId,
      'canEditContent',
    );

    const fields: Record<string, any> = {};
    if (request.title !== undefined) {
      fields.title = requireNonEmpty(request.title, 'El nombre del blog');
      fields.searchTitle = toSearchText(fields.title);
    }
    if (request.description !== undefined) {
      fields.description = request.description.trim();
      fields.searchDescription = toSearchText(fields.description);
    }
    if (request.headerPhotoKey !== undefined) {
      fields.headerPhotoKey = request.headerPhotoKey || null;
    }
    if (request.welcomeText !== undefined) {
      fields.welcomeText = request.welcomeText || null;
    }
    if (request.welcomeVideoKey !== undefined) {
      fields.welcomeVideoKey = request.welcomeVideoKey || null;
    }
    if (request.shelf !== undefined) {
      fields.shelf = this.mapShelf(request);
    }
    if (request.showcase !== undefined) {
      const uniqueIds = Array.from(new Set(request.showcase));
      const items = await this.itemRepository.findByIds(productionId, uniqueIds);
      const valid = items.filter((item) => item.countsForQuota);
      if (valid.length !== uniqueIds.length) {
        throw new BadRequestException(
          'El muestrario sólo puede incluir archivos o artículos de este blog',
        );
      }
      fields.showcase = uniqueIds;
    }

    const updated =
      Object.keys(fields).length > 0
        ? await this.productionRepository.updateById(productionId, fields)
        : production;
    if (!updated) throw new NotFoundException('Producción no encontrada');

    const limits = await this.accessService.getCreatorLimits(updated);
    return toProductionResponse(
      updated,
      role,
      { listed: true, canViewContent: true },
      { filesPerBlogLimit: limits.filesPerBlogLimit },
    );
  }

  async deleteProduction(productionId: string, userId: string): Promise<void> {
    const production = await this.getProductionOrFail(productionId);
    await this.accessService.assertPermission(
      production,
      userId,
      'canDeleteBlog',
    );
    await this.inTransaction((session) =>
      this.cascadeService.deleteProduction(production, session),
    );
    this.logger.log('Production deleted: ' + productionId);
  }

  // ---------------------------------------------------------------------------
  // Árbol: carpetas, archivos y artículos
  // ---------------------------------------------------------------------------

  async createFolder(
    request: ProductionFolderRequest,
    userId: string,
  ): Promise<ProductionItemResponse> {
    const production = await this.getProductionOrFail(request.productionId);
    const role = await this.accessService.assertPermission(
      production,
      userId,
      'canEditContent',
    );
    await this.assertValidParent(production.getId!, request.parentId);

    const folder = this.factory.createFolder(request, userId);
    const id = await this.itemRepository.create(folder);
    const created = await this.getItemOrFail(id);
    return this.buildItemView(production, created, role);
  }

  async updateFolder(
    itemId: string,
    request: ProductionFolderUpdateRequest,
    userId: string,
  ): Promise<ProductionItemResponse> {
    const item = await this.getItemOrFail(itemId, ProductionItemKind.folder);
    const production = await this.getProductionOrFail(item.getProduction);
    const role = await this.accessService.assertPermission(
      production,
      userId,
      'canEditContent',
    );
    const updated = await this.itemRepository.updateById(itemId, {
      name: requireNonEmpty(request.name, 'El nombre de la carpeta'),
    });
    return this.buildItemView(production, updated!, role);
  }

  async uploadFile(
    request: ProductionFileRequest,
    userId: string,
  ): Promise<ProductionItemResponse> {
    const production = await this.getProductionOrFail(request.productionId);
    const role = await this.accessService.assertPermission(
      production,
      userId,
      'canEditContent',
    );
    await this.assertValidParent(production.getId!, request.parentId);

    const id = await this.createCountedItem(production, (session) =>
      this.resolveFileName(
        production.getId!,
        request.parentId ?? null,
        request.fileName,
        'archivo',
        session,
      ).then((fileName) => this.factory.createFile(request, fileName, userId)),
    );
    const created = await this.getItemOrFail(id);
    return this.buildItemView(production, created, role);
  }

  async createArticle(
    request: ProductionArticleRequest,
    userId: string,
  ): Promise<ProductionItemResponse> {
    const production = await this.getProductionOrFail(request.productionId);
    const role = await this.accessService.assertPermission(
      production,
      userId,
      'canEditContent',
    );
    await this.assertValidParent(production.getId!, request.parentId);

    const id = await this.createCountedItem(production, (session) =>
      this.resolveFileName(
        production.getId!,
        request.parentId ?? null,
        request.fileName,
        'articulo',
        session,
      ).then((fileName) =>
        this.factory.createArticle(request, fileName, userId),
      ),
    );
    const created = await this.getItemOrFail(id);
    return this.buildItemView(production, created, role);
  }

  /** Crea un archivo o artículo reservando antes el cupo, en una transacción. */
  private async createCountedItem(
    production: Production,
    build: (session: ClientSession) => Promise<ProductionFile | ProductionArticle>,
  ): Promise<string> {
    try {
      return await this.inTransaction(async (session) => {
        await this.reserveFileSlot(production, session);
        const item = await build(session);
        return this.itemRepository.create(item, session);
      });
    } catch (error: any) {
      if (isDuplicateKeyError(error, 'fileName')) {
        throw new BadRequestException(
          'Ya existe un elemento con ese ID en esta carpeta',
        );
      }
      throw error;
    }
  }

  async updateFile(
    itemId: string,
    request: ProductionFileUpdateRequest,
    userId: string,
  ): Promise<ProductionItemResponse> {
    const item = await this.getItemOrFail(itemId, ProductionItemKind.file);
    const production = await this.getProductionOrFail(item.getProduction);
    const role = await this.accessService.assertPermission(
      production,
      userId,
      'canEditContent',
    );

    const updated = await this.updateContentItem(item, async (session) => {
      const fields: Record<string, any> = {};
      if (request.fileName !== undefined) {
        fields.fileName = await this.resolveFileName(
          item.getProduction,
          item.getParent,
          request.fileName,
          'archivo',
          session,
          itemId,
        );
      }
      if (request.name !== undefined) {
        fields.name = requireNonEmpty(request.name, 'El título del archivo');
      }
      if (request.postcard !== undefined) {
        fields.postcard = request.postcard ? { ...request.postcard } : null;
      }
      return fields;
    });
    return this.buildItemView(production, updated, role);
  }

  async updateArticle(
    itemId: string,
    request: ProductionArticleUpdateRequest,
    userId: string,
  ): Promise<ProductionItemResponse> {
    const item = await this.getItemOrFail(itemId, ProductionItemKind.article);
    const production = await this.getProductionOrFail(item.getProduction);
    const role = await this.accessService.assertPermission(
      production,
      userId,
      'canEditContent',
    );

    const updated = await this.updateContentItem(item, async (session) => {
      const fields: Record<string, any> = {};
      if (request.fileName !== undefined) {
        fields.fileName = await this.resolveFileName(
          item.getProduction,
          item.getParent,
          request.fileName,
          'articulo',
          session,
          itemId,
        );
      }
      if (request.title !== undefined) {
        fields.name = requireNonEmpty(request.title, 'El título del artículo');
      }
      if (request.blocks !== undefined) {
        fields.blocks = request.blocks.map(({ type, data }) => ({ type, data }));
      }
      return fields;
    });
    return this.buildItemView(production, updated, role);
  }

  private async updateContentItem(
    item: ProductionItem,
    buildFields: (session: ClientSession) => Promise<Record<string, any>>,
  ): Promise<ProductionItem> {
    try {
      return await this.inTransaction(async (session) => {
        const fields = await buildFields(session);
        if (Object.keys(fields).length === 0) return item;
        const updated = await this.itemRepository.updateById(
          item.getId!,
          fields,
          session,
        );
        if (!updated) throw new NotFoundException('Elemento no encontrado');
        return updated;
      });
    } catch (error: any) {
      if (isDuplicateKeyError(error, 'fileName')) {
        throw new BadRequestException(
          'Ya existe un elemento con ese ID en esta carpeta',
        );
      }
      throw error;
    }
  }

  async deleteItem(
    itemId: string,
    kind: ProductionItemKind,
    userId: string,
  ): Promise<void> {
    const item = await this.getItemOrFail(itemId, kind);
    const production = await this.getProductionOrFail(item.getProduction);
    await this.accessService.assertPermission(
      production,
      userId,
      'canEditContent',
    );
    await this.inTransaction((session) =>
      this.cascadeService.deleteItems(production, [itemId], session),
    );
  }

  // ---------------------------------------------------------------------------
  // Lectura
  // ---------------------------------------------------------------------------

  private async buildProductionView(
    production: Production,
    viewer: ProductionViewerContext,
    decision: AccessDecision,
  ): Promise<ProductionResponse> {
    const [ownerInfo, limits] = await Promise.all([
      this.productionRepository.findOwnerInfo(
        production.getOwner,
        production.getOwnerType,
      ),
      this.accessService.canSeeInsights(viewer.role)
        ? this.accessService.getCreatorLimits(production)
        : Promise.resolve(null),
    ]);
    const extras = await this.accessService.getViewerExtras(production, viewer);
    return toProductionResponse(production, viewer.role, decision, {
      ownerInfo,
      filesPerBlogLimit: limits?.filesPerBlogLimit ?? null,
      pendingReviewProductionId: viewer.pendingReviewProductionId,
      ...extras,
    });
  }

  private async openProduction(
    production: Production | null,
    userId?: string,
    accessKey?: string,
  ) {
    if (!production) throw new NotFoundException('Producción no encontrada');
    const viewer = await this.accessService.buildViewerContext(
      production,
      userId,
      accessKey,
    );
    const decision = this.accessService.evaluateProduction(production, viewer);
    if (!decision.listed) {
      // No se revela la existencia de lo que está fuera del alcance.
      throw new NotFoundException('Producción no encontrada');
    }
    return { production, viewer, decision };
  }

  async findProductionById(
    productionId: string,
    userId?: string,
    accessKey?: string,
  ): Promise<ProductionResponse> {
    const { production, viewer, decision } = await this.openProduction(
      await this.productionRepository.findById(productionId),
      userId,
      accessKey,
    );
    return this.buildProductionView(production, viewer, decision);
  }

  async findProductionByUrl(
    url: string,
    userId?: string,
    accessKey?: string,
  ): Promise<ProductionResponse> {
    const { production, viewer, decision } = await this.openProduction(
      await this.productionRepository.findByUrl(url),
      userId,
      accessKey,
    );
    return this.buildProductionView(production, viewer, decision);
  }

  /**
   * Arma las tarjetas de un listado: el alcance del visitante se calcula una
   * sola vez y los dueños se traen en una sola consulta.
   */
  private async buildListViews(
    productions: Production[],
    scope: ProductionViewerScope,
  ): Promise<ProductionResponse[]> {
    const ownersInfo = await this.productionRepository.findOwnersInfo(
      productions.map((production) => ({
        ownerId: production.getOwner,
        ownerType: production.getOwnerType,
      })),
    );

    const views: ProductionResponse[] = [];
    for (const production of productions) {
      const viewer = await this.accessService.contextFor(production, scope);
      const decision = this.accessService.evaluateProduction(production, viewer);
      if (!decision.listed) continue;
      const limits = this.accessService.canSeeInsights(viewer.role)
        ? await this.accessService.getCreatorLimits(production)
        : null;
      const extras = await this.accessService.getViewerExtras(
        production,
        viewer,
      );
      views.push(
        toProductionResponse(production, viewer.role, decision, {
          ownerInfo: ownersInfo.get(production.getOwner) ?? null,
          filesPerBlogLimit: limits?.filesPerBlogLimit ?? null,
          pendingReviewProductionId: viewer.pendingReviewProductionId,
          ...extras,
        }),
      );
    }
    return views;
  }

  async findProductionsByOwner(
    ownerId: string,
    ownerType: ProductionOwnerType | undefined,
    userId?: string,
  ): Promise<ProductionResponse[]> {
    const scope = await this.accessService.buildViewerScope(userId);
    // En el cartel se muestran también los blogs con clave (para poder
    // ingresarla) y los moderados sólo le llegan al staff (lo filtra el
    // evaluador).
    const { productions } = await this.productionRepository.findList(
      {
        ownerId,
        ownerType,
        visibilityConditions: this.accessService.buildListVisibilityConditions(
          scope,
        ),
        includeKeyProtected: true,
        includeModerated: true,
      },
      1,
      MAX_OWNER_PRODUCTIONS,
    );
    return this.buildListViews(productions, scope);
  }

  /** Listado público y buscador de producciones (NAV-02, NAV-05). */
  async findAllProductions(
    page: number,
    limit: number,
    userId?: string,
    searchTerm?: string,
  ): Promise<ProductionListResponse> {
    const { safePage, safeLimit } = normalizePagination(page, limit);
    const searchRegex = buildProductionSearchRegex(searchTerm);
    if (searchTerm && !searchRegex) return { productions: [], hasMore: false };

    const scope = await this.accessService.buildViewerScope(userId);
    const { productions, hasMore } = await this.productionRepository.findList(
      {
        visibilityConditions: this.accessService.buildListVisibilityConditions(
          scope,
        ),
        searchRegex,
        includeKeyProtected: false,
        includeModerated: false,
      },
      safePage,
      safeLimit,
    );
    return {
      productions: await this.buildListViews(productions, scope),
      hasMore,
    };
  }

  /**
   * "Producciones destacadas" del home (NAV-03): primero las marcadas por un
   * admin y después las de más fans. Si no hay, la lista viene vacía y el front
   * no muestra la sección.
   */
  async findFeaturedProductions(
    limit: number,
    userId?: string,
  ): Promise<ProductionResponse[]> {
    const { safeLimit } = normalizePagination(1, limit);
    const scope = await this.accessService.buildViewerScope(userId);
    const productions = await this.productionRepository.findFeatured(
      {
        visibilityConditions: this.accessService.buildListVisibilityConditions(
          scope,
        ),
        includeKeyProtected: false,
        includeModerated: false,
      },
      safeLimit,
    );
    return this.buildListViews(productions, scope);
  }

  /** Sólo admins de la plataforma: fija o quita un blog de destacados. */
  async setProductionFeatured(
    productionId: string,
    isFeatured: boolean,
  ): Promise<ProductionResponse> {
    const production = await this.productionRepository.setFeatured(
      productionId,
      isFeatured,
    );
    if (!production) throw new NotFoundException('Producción no encontrada');
    const [view] = await this.buildListViews(
      [production],
      await this.accessService.buildViewerScope(null),
    );
    return (
      view ??
      toProductionResponse(
        production,
        ProductionRole.visitor,
        { listed: true, canViewContent: false },
        {},
      )
    );
  }

  async getProductionItems(
    productionId: string,
    parentId: string | undefined,
    userId?: string,
    accessKey?: string,
  ): Promise<ProductionItemsResponse> {
    const { production, viewer, decision } = await this.openProduction(
      await this.productionRepository.findById(productionId),
      userId,
      accessKey,
    );
    const productionView = await this.buildProductionView(
      production,
      viewer,
      decision,
    );

    // Sin acceso al blog (clave o reseña pendiente) se muestra sólo el header.
    if (!decision.canViewContent) {
      return {
        production: productionView,
        parent: null,
        breadcrumb: [],
        items: [],
      };
    }

    const tickets = await this.accessService.getTickets(production.getId!);
    let parent: ProductionItem | null = null;
    let ancestors: ProductionItem[] = [];
    if (parentId) {
      parent = await this.getItemOrFail(parentId, ProductionItemKind.folder);
      if (parent.getProduction !== production.getId) {
        throw new NotFoundException('Elemento no encontrado');
      }
      ancestors = await this.itemRepository.findAncestors(parentId);
    }
    const parentChain = parent ? [parent, ...ancestors] : [];

    let parentView: ProductionItemResponse | null = null;
    if (parent) {
      const parentDecision = this.evaluateItem(
        production,
        parentChain,
        tickets,
        viewer,
      );
      if (!parentDecision.listed) {
        throw new NotFoundException('Elemento no encontrado');
      }
      parentView = await this.toItemView(
        production,
        parent,
        parentChain,
        parentDecision,
        viewer,
        tickets,
      );
    }

    const children = await this.itemRepository.findChildren(
      production.getId!,
      parentId ?? null,
    );
    const items: ProductionItemResponse[] = [];
    for (const child of children) {
      const chain = [child, ...parentChain];
      const childDecision = this.evaluateItem(production, chain, tickets, viewer);
      if (!childDecision.listed) continue;
      items.push(
        await this.toItemView(
          production,
          child,
          chain,
          childDecision,
          viewer,
          tickets,
        ),
      );
    }

    return {
      production: productionView,
      parent: parentView,
      breadcrumb: [...parentChain]
        .reverse()
        .map((node) => ({ _id: node.getId!, name: node.getName })),
      items,
    };
  }

  async getProductionItemById(
    itemId: string,
    userId?: string,
    accessKey?: string,
  ): Promise<ProductionItemResponse> {
    const item = await this.getItemOrFail(itemId);
    const { production, viewer, decision } = await this.openProduction(
      await this.productionRepository.findById(item.getProduction),
      userId,
      accessKey,
    );
    if (!decision.canViewContent) {
      throw new NotFoundException('Elemento no encontrado');
    }
    const tickets = await this.accessService.getTickets(production.getId!);
    const chain = [item, ...(await this.itemRepository.findAncestors(itemId))];
    const itemDecision = this.evaluateItem(production, chain, tickets, viewer);
    if (!itemDecision.listed) {
      throw new NotFoundException('Elemento no encontrado');
    }
    const view = await this.toItemView(
      production,
      item,
      chain,
      itemDecision,
      viewer,
      tickets,
    );
    if (itemDecision.canViewContent) {
      await this.accessService.registerContentAccess(viewer, itemDecision);
    }
    return view;
  }

  private evaluateItem(
    production: Production,
    chain: ProductionItem[],
    tickets: TicketRef[],
    viewer: ProductionViewerContext,
  ): AccessDecision {
    return evaluateItemAccess({
      production: {
        _id: production.getId!,
        visibility: production.getVisibility!,
        hasAccessKey: production.hasAccessKey,
      },
      chain: chain.map((node) => ({
        _id: node.getId!,
        visibility: node.getVisibility,
        moderationStatus: node.getModerationStatus,
      })),
      tickets,
      viewer,
    });
  }

  private async toItemView(
    production: Production,
    item: ProductionItem,
    chain: ProductionItem[],
    decision: AccessDecision,
    viewer: ProductionViewerContext,
    tickets: TicketRef[],
  ): Promise<ProductionItemResponse> {
    return toItemResponse(item, {
      role: viewer.role,
      decision,
      effectiveVisibility: resolveEffectiveVisibility(
        chain.map((node) => node.getVisibility),
        production.getVisibility,
      ),
      ticket: this.accessService.toTicketSummary(decision.ticketId, tickets),
    });
  }

  async getProductionLimits(userId: string): Promise<ProductionLimitsResponse> {
    return this.userService.getProductionLimitsFromUserByUserId(userId);
  }

  // ---------------------------------------------------------------------------
  // Alcance y clave (Fase 3)
  // ---------------------------------------------------------------------------

  /** Alcance por defecto del blog (VIS-01). */
  async setProductionVisibility(
    productionId: string,
    visibility: Visibility,
    userId: string,
  ): Promise<ProductionResponse> {
    const production = await this.getProductionOrFail(productionId);
    await this.accessService.assertPermission(
      production,
      userId,
      'canManageAccess',
    );
    await this.productionRepository.updateById(productionId, { visibility });
    return this.findProductionById(productionId, userId);
  }

  /**
   * Alcance propio de una carpeta o archivo (VIS-04). null = vuelve a heredar
   * del padre (VIS-03).
   */
  async setProductionItemVisibility(
    itemId: string,
    visibility: Visibility | null,
    userId: string,
  ): Promise<ProductionItemResponse> {
    const item = await this.getItemOrFail(itemId);
    const production = await this.getProductionOrFail(item.getProduction);
    const role = await this.accessService.assertPermission(
      production,
      userId,
      'canManageAccess',
    );
    const updated = await this.itemRepository.updateById(itemId, {
      visibility: visibility ?? null,
    });
    return this.buildItemView(production, updated!, role);
  }

  /**
   * Configura o quita la clave del blog (INV-01, RNF-13). Cambiarla invalida
   * los accesos otorgados con la clave anterior.
   */
  async setProductionAccessKey(
    productionId: string,
    accessKey: string | null,
    userId: string,
  ): Promise<ProductionResponse> {
    const production = await this.getProductionOrFail(productionId);
    await this.accessService.assertPermission(
      production,
      userId,
      'canManageAccess',
    );
    const hash = accessKey ? await hashAccessKey(accessKey) : null;
    await this.productionRepository.setAccessKeyHash(productionId, hash);
    this.logger.log(
      `Access key ${hash ? 'set' : 'removed'} for production ${productionId}`,
    );
    return this.findProductionById(productionId, userId);
  }

  /** El visitante ingresa la clave del blog (tipo Zoom). */
  async unlockProductionWithKey(
    productionId: string,
    accessKey: string,
    userId: string | undefined,
  ): Promise<ProductionResponse> {
    const production = await this.getProductionOrFail(productionId);
    if (!production.hasAccessKey) {
      return this.findProductionById(productionId, userId);
    }
    await this.accessService.unlockWithKey(production, userId, accessKey);
    return this.findProductionById(productionId, userId);
  }
}
