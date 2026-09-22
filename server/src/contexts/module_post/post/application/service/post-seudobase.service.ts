import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { PostSeudoBaseServiceInterface } from '../../domain/service/post-seudobase.service.interface';
import {
  PostSeudoBaseRepositoryInterface,
  PostSeudoBaseRow,
} from '../../domain/repository/post-seudobase.repository.interface';
import { PostAuditRepositoryInterface } from '../../domain/repository/post-audit.repository.interface';
import {
  PostBulkDeleteInput,
  PostBulkPriceInput,
  PostBulkVisibilityInput,
  PostSeudoBaseFilters,
  POST_SEUDOBASE_MAX_ITEMS,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/post-seudobase.request';
import {
  PostAuditLogResponse,
  PostBulkResultResponse,
  PostSeudoBaseResponse,
} from '../../domain/entity/models_graphql/HTTP-RESPONSE/post-seudobase.response';
import { PostBulkAction, PostPriceChangeMode } from '../../domain/entity/enum/post-seudobase.enums';
import { removeAccents_removeEmojisAndToLowerCase } from '../../domain/utils/normalice.data';

const MAX_PAGE_SIZE = 100;
/** Precio sentinela que el front interpreta como "Negociable / a pactar". */
const NEGOTIABLE_PRICE = 8613.1;
const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * SeudoBase de Anuncios: vista tipo Excel y operaciones masivas sobre los
 * anuncios del propio usuario (SB-01/02/03). Espeja el patrón de la SeudoBase
 * de Producciones, pero:
 *  - deriva el autor del token (`userId`), nunca de un `author_id` del cliente;
 *  - filtra SIEMPRE por `author`, así no se puede operar sobre anuncios ajenos;
 *  - toda operación masiva exige `confirm: true` y queda auditada.
 */
@Injectable()
export class PostSeudoBaseService implements PostSeudoBaseServiceInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @InjectConnection() private readonly connection: Connection,
    @Inject('PostSeudoBaseRepositoryInterface')
    private readonly seudoBaseRepository: PostSeudoBaseRepositoryInterface,
    @Inject('PostAuditRepositoryInterface')
    private readonly auditRepository: PostAuditRepositoryInterface,
  ) {}

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

  /**
   * Valida una operación masiva y carga los anuncios objetivo verificando que
   * TODOS pertenezcan al usuario. Espeja `loadBulkTargets` de Producciones.
   */
  private async loadBulkTargets(
    userId: string,
    postIds: string[],
    confirm: boolean,
  ): Promise<PostSeudoBaseRow[]> {
    if (!userId) {
      throw new UnauthorizedException('Tenés que iniciar sesión');
    }
    if (confirm !== true) {
      throw new BadRequestException(
        'Confirmá la operación masiva antes de aplicarla',
      );
    }
    const ids = Array.from(new Set(postIds ?? []));
    if (ids.length === 0) {
      throw new BadRequestException('Seleccioná al menos un anuncio');
    }
    if (ids.length > POST_SEUDOBASE_MAX_ITEMS) {
      throw new BadRequestException(
        `Una operación masiva admite hasta ${POST_SEUDOBASE_MAX_ITEMS} anuncios`,
      );
    }
    const posts = await this.seudoBaseRepository.findOwnedByIds(userId, ids);
    if (posts.length !== ids.length) {
      throw new BadRequestException(
        'Algunos anuncios seleccionados no son tuyos o no existen',
      );
    }
    return posts;
  }

  // ---------------------------------------------------------------------------
  // Vista tipo Excel (SB-01)
  // ---------------------------------------------------------------------------

  async getPostSeudoBase(
    userId: string,
    filters: PostSeudoBaseFilters | undefined,
    page: number,
    limit: number,
  ): Promise<PostSeudoBaseResponse> {
    if (!userId) throw new UnauthorizedException('Tenés que iniciar sesión');

    const safePage = Math.max(1, Math.floor(page) || 1);
    const safeLimit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Math.floor(limit) || 20),
    );

    let searchRegex: RegExp | null = null;
    if (filters?.searchTerm) {
      const normalized = removeAccents_removeEmojisAndToLowerCase(
        filters.searchTerm,
      );
      if (!normalized) {
        return { rows: [], total: 0, hasMore: false };
      }
      // searchTitle ya está normalizado en la DB; se busca por substring.
      searchRegex = new RegExp(
        normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i',
      );
    }

    const { rows, total, hasMore } = await this.seudoBaseRepository.search(
      {
        authorId: userId,
        postTypes: filters?.postTypes,
        isActive: filters?.isActive,
        searchRegex,
      },
      safePage,
      safeLimit,
    );

    return { rows, total, hasMore };
  }

  // ---------------------------------------------------------------------------
  // Operaciones masivas (SB-02/03)
  // ---------------------------------------------------------------------------

  async bulkUpdatePostPrices(
    input: PostBulkPriceInput,
    userId: string,
  ): Promise<PostBulkResultResponse> {
    const posts = await this.loadBulkTargets(
      userId,
      input.postIds,
      input.confirm,
    );

    if (!Number.isFinite(input.value)) {
      throw new BadRequestException('El valor del cambio de precio no es válido');
    }
    if (
      input.mode === PostPriceChangeMode.percentage &&
      input.value <= -100
    ) {
      throw new BadRequestException('El porcentaje tiene que ser mayor a -100');
    }

    const updates: { postId: string; price: number }[] = [];
    const changes: { postId: string; before: number; after: number }[] = [];
    const skipped: string[] = [];

    for (const post of posts) {
      // Los anuncios "Negociable" no se tocan en cambios porcentuales.
      if (
        input.mode === PostPriceChangeMode.percentage &&
        post.price === NEGOTIABLE_PRICE
      ) {
        skipped.push(post._id);
        continue;
      }
      const price =
        input.mode === PostPriceChangeMode.percentage
          ? round2(post.price * (1 + input.value / 100))
          : round2(input.value);
      if (!(price > 0)) {
        throw new BadRequestException(
          'El precio resultante tiene que ser mayor a 0',
        );
      }
      updates.push({ postId: post._id, price });
      changes.push({ postId: post._id, before: post.price, after: price });
    }

    const auditId = await this.inTransaction(async (session) => {
      await this.seudoBaseRepository.bulkSetPrice(updates, session);
      return this.auditRepository.create(
        {
          actor: userId,
          action: PostBulkAction.price,
          postIds: posts.map((post) => post._id),
          affectedCount: updates.length,
          details: JSON.stringify({
            mode: input.mode,
            value: input.value,
            changes,
            skipped,
          }),
        },
        session,
      );
    });

    this.logger.log(
      `Bulk price de anuncios: ${updates.length} anuncios del usuario ${userId}`,
    );
    return {
      action: PostBulkAction.price,
      requested: posts.length,
      affected: updates.length,
      skipped,
      auditId,
    };
  }

  async bulkUpdatePostVisibility(
    input: PostBulkVisibilityInput,
    userId: string,
  ): Promise<PostBulkResultResponse> {
    const posts = await this.loadBulkTargets(
      userId,
      input.postIds,
      input.confirm,
    );
    const ids = posts.map((post) => post._id);

    const auditId = await this.inTransaction(async (session) => {
      await this.seudoBaseRepository.bulkSetVisibility(
        userId,
        ids,
        input.visibility,
        session,
      );
      return this.auditRepository.create(
        {
          actor: userId,
          action: PostBulkAction.visibility,
          postIds: ids,
          affectedCount: ids.length,
          details: JSON.stringify({
            visibility: input.visibility,
            before: posts.map((post) => ({
              postId: post._id,
              visibility: post.visibility,
            })),
          }),
        },
        session,
      );
    });

    return {
      action: PostBulkAction.visibility,
      requested: ids.length,
      affected: ids.length,
      skipped: [],
      auditId,
    };
  }

  async bulkDeletePosts(
    input: PostBulkDeleteInput,
    userId: string,
  ): Promise<PostBulkResultResponse> {
    const posts = await this.loadBulkTargets(
      userId,
      input.postIds,
      input.confirm,
    );
    const ids = posts.map((post) => post._id);

    const auditId = await this.inTransaction(async (session) => {
      await this.seudoBaseRepository.bulkDelete(userId, ids, session);
      return this.auditRepository.create(
        {
          actor: userId,
          action: PostBulkAction.delete,
          postIds: ids,
          affectedCount: ids.length,
          details: JSON.stringify({
            deleted: posts.map((post) => ({
              postId: post._id,
              postType: post.postType,
              title: post.title,
            })),
          }),
        },
        session,
      );
    });

    this.logger.log(
      `Bulk delete de anuncios: ${ids.length} anuncios del usuario ${userId}`,
    );
    return {
      action: PostBulkAction.delete,
      requested: ids.length,
      affected: ids.length,
      skipped: [],
      auditId,
    };
  }

  async getPostAuditLog(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PostAuditLogResponse> {
    if (!userId) throw new UnauthorizedException('Tenés que iniciar sesión');
    const safePage = Math.max(1, Math.floor(page) || 1);
    const safeLimit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Math.floor(limit) || 20),
    );
    const { entries, total } = await this.auditRepository.list(
      userId,
      safePage,
      safeLimit,
    );
    return {
      entries,
      total,
      hasMore: safePage * safeLimit < total,
    };
  }
}
