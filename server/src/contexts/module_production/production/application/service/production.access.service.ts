import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientSession, Types } from 'mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { PubliciteAuth } from 'src/contexts/module_shared/auth/publicite_auth/publicite_auth';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';
import { ProductionLimits } from 'src/contexts/module_user/user/application/functions/calculateProductionLimits';
import { makeUserRelationHierarchyMap } from 'src/contexts/module_shared/utils/functions/makeUserRelationHierarchyMap';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';
import { Production } from '../../domain/entity/production.entity';
import {
  ProductionOwnerType,
  ProductionRole,
} from '../../domain/entity/enum/production.enums';
import { ProductionRepositoryInterface } from '../../domain/repository/production.repository.interface';
import { ProductionTicketSummaryResponse } from '../../domain/entity/models_graphql/HTTP-RESPONSE/production.response';
import {
  AccessDecision,
  evaluateItemAccess,
  evaluateProductionAccess,
  ProductionViewerContext,
  TicketRef,
} from '../functions/production.access';
import { ProductionItem } from '../../domain/entity/production-item.entity';
import { ProductionTicket } from '../../domain/entity/production-ticket.entity';
import { ProductionItemRepositoryInterface } from '../../domain/repository/production-item.repository.interface';
import {
  ProductionTicketPurchaseRepositoryInterface,
  ProductionTicketRepositoryInterface,
} from '../../domain/repository/production-ticket.repository.interface';
import { toTicketSummary } from '../functions/production-ticket.view';
import { ProductionCommunityRepositoryInterface } from '../../domain/repository/production-community.repository.interface';
import {
  ProductionPermissions,
  resolveProductionRole,
} from '../functions/production.roles';
import { verifyAccessKey } from '../functions/production.access-key';
import { ProductionAccessGrantRepositoryInterface } from '../../domain/repository/production-access-grant.repository.interface';
import {
  getAccessKeyLockMinutes,
  getAccessKeyMaxAttempts,
} from 'src/contexts/module_shared/production-limits/production.limits.config';

export type ProductionPermission = keyof typeof ProductionPermissions;

const PERMISSION_MESSAGES: Record<ProductionPermission, string> = {
  canViewAll: 'No tenés acceso a este blog',
  canEditContent: 'No tenés permisos para editar este blog',
  canManageAccess: 'No tenés permisos para gestionar el acceso de este blog',
  canBulkEdit: 'No tenés permisos para editar este blog en forma masiva',
  canViewInsights: 'No tenés permisos para ver los datos de este blog',
  canDeleteBlog: 'Sólo el administrador del blog puede borrarlo',
  canManagePayout: 'Sólo el administrador del blog puede gestionar el cobro',
};

const GROUP_ROLE: Record<'creator' | 'admin' | 'member', ProductionRole> = {
  creator: ProductionRole.admin,
  admin: ProductionRole.moderator,
  member: ProductionRole.viewer,
};

/**
 * Lo que se sabe del visitante independientemente del blog: se calcula una vez
 * por request y se reutiliza para evaluar cada producción de un listado.
 */
export interface ProductionViewerScope {
  userId?: string;
  /** ownerId → niveles de la agenda que la relación habilita (VIS-01). */
  relationMap: Map<string, string[]>;
  /** groupId → rol del visitante en ese grupo (GRP-04..07). */
  groupRoles: Map<string, ProductionRole>;
  /** Producción con reseña pendiente que bloquea al visitante (REV-02). */
  pendingReviewProductionId: string | null;
}

/**
 * Resuelve quién consulta un blog y qué puede hacer (roles GRP-04..07 y
 * capas de acceso de §4). Centraliza la autorización de MP: el resolver sólo
 * valida el token, y la propiedad se verifica contra el dueño REAL guardado,
 * nunca contra un id que mande el cliente.
 */
@Injectable()
export class ProductionAccessService {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('ProductionRepositoryInterface')
    private readonly productionRepository: ProductionRepositoryInterface,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
    @Inject('ProductionAccessGrantRepositoryInterface')
    private readonly grantRepository: ProductionAccessGrantRepositoryInterface,
    @Inject('ProductionItemRepositoryInterface')
    private readonly itemRepository: ProductionItemRepositoryInterface,
    @Inject('ProductionTicketRepositoryInterface')
    private readonly ticketRepository: ProductionTicketRepositoryInterface,
    @Inject('ProductionTicketPurchaseRepositoryInterface')
    private readonly purchaseRepository: ProductionTicketPurchaseRepositoryInterface,
    @Inject('ProductionCommunityRepositoryInterface')
    private readonly communityRepository: ProductionCommunityRepositoryInterface,
  ) {}

  // ---------------------------------------------------------------------------
  // Roles y permisos
  // ---------------------------------------------------------------------------

  async resolveRole(
    production: Production,
    userId?: string | null,
  ): Promise<ProductionRole> {
    if (!userId) return ProductionRole.visitor;
    const group =
      production.getOwnerType === ProductionOwnerType.Group
        ? await this.productionRepository.findGroupRoster(production.getOwner)
        : null;
    return resolveProductionRole({
      userId,
      ownerType: production.getOwnerType,
      ownerId: production.getOwner,
      group,
    });
  }

  /**
   * Exige un permiso sobre el blog. En blogs personales la propiedad se valida
   * con `PubliciteAuth.authorize` contra el dueño guardado (BLG-05, RNF-03).
   */
  async assertPermission(
    production: Production,
    userId: string | undefined,
    permission: ProductionPermission,
  ): Promise<ProductionRole> {
    if (!userId) {
      throw new UnauthorizedException('Tenés que iniciar sesión');
    }
    if (production.getOwnerType === ProductionOwnerType.User) {
      PubliciteAuth.authorize(userId, production.getOwner);
    }
    const role = await this.resolveRole(production, userId);
    if (!ProductionPermissions[permission](role)) {
      this.logger.warn(
        `Permiso ${permission} denegado en la producción ${production.getId} (rol ${role})`,
      );
      throw new UnauthorizedException(PERMISSION_MESSAGES[permission]);
    }
    return role;
  }

  canSeeInsights(role: ProductionRole): boolean {
    return ProductionPermissions.canViewInsights(role);
  }

  // ---------------------------------------------------------------------------
  // Contexto del visitante
  // ---------------------------------------------------------------------------

  async buildViewerScope(userId?: string | null): Promise<ProductionViewerScope> {
    if (!userId) {
      return {
        relationMap: new Map(),
        groupRoles: new Map(),
        pendingReviewProductionId: null,
      };
    }

    const [activeRelations, groupRoles] = await Promise.all([
      this.userService.getActiveRelationOfUser(userId),
      this.productionRepository.findGroupRolesOfUser(userId),
    ]);

    const roles = new Map<string, ProductionRole>();
    groupRoles.forEach((role, groupId) => roles.set(groupId, GROUP_ROLE[role]));

    return {
      userId,
      relationMap:
        activeRelations && activeRelations.length > 0
          ? makeUserRelationHierarchyMap(activeRelations, userId)
          : new Map(),
      groupRoles: roles,
      pendingReviewProductionId: await this.findPendingReview(userId),
    };
  }

  /** Rol del visitante en un blog, usando el scope ya calculado. */
  roleFromScope(
    production: Production,
    scope: ProductionViewerScope,
  ): ProductionRole {
    if (!scope.userId) return ProductionRole.visitor;
    if (production.getOwnerType === ProductionOwnerType.User) {
      return production.getOwner === scope.userId
        ? ProductionRole.admin
        : ProductionRole.visitor;
    }
    return scope.groupRoles.get(production.getOwner) ?? ProductionRole.visitor;
  }

  /**
   * Contexto del visitante para evaluar alcance, clave, tickets y reseñas.
   * Los listados no necesitan los tickets (se evalúan por ítem).
   */
  async contextFor(
    production: Production,
    scope: ProductionViewerScope,
    options: { accessKey?: string | null; includeTickets?: boolean } = {},
  ): Promise<ProductionViewerContext> {
    const role = this.roleFromScope(production, scope);
    const isVisitor = role === ProductionRole.visitor;
    const ticketAccess =
      isVisitor && options.includeTickets && scope.userId
        ? await this.findTicketAccess(production, scope.userId)
        : { activeTicketIds: new Set<string>(), purchasesByTicket: new Map() };
    return {
      userId: scope.userId,
      isRegistered: !!scope.userId,
      role,
      // En blogs de grupo no hay agenda de contactos: se comparte con miembros.
      relationVisibilities:
        isVisitor && production.getOwnerType === ProductionOwnerType.User
          ? scope.relationMap.get(production.getOwner) ?? []
          : [],
      hasKeyAccess: await this.hasKeyAccess(
        production,
        scope,
        options.accessKey,
      ),
      activeTicketIds: ticketAccess.activeTicketIds,
      activePurchasesByTicket: ticketAccess.purchasesByTicket,
      pendingReviewProductionId: scope.pendingReviewProductionId,
    };
  }

  /**
   * Tickets vigentes que el visitante tiene comprados en el blog (TKT-07/08).
   * Una compra habilita el ticket actual de su mismo destino, así que si el
   * creador recrea el ticket de una carpeta el comprador no pierde el acceso.
   * El vencimiento se evalúa acá mismo: lo vencido no habilita.
   */
  private async findTicketAccess(
    production: Production,
    userId: string,
  ): Promise<{
    activeTicketIds: Set<string>;
    purchasesByTicket: Map<string, string[]>;
  }> {
    const activeTicketIds = new Set<string>();
    const purchasesByTicket = new Map<string, string[]>();
    const purchases = await this.purchaseRepository.findActiveByBuyer(
      userId,
      production.getId!,
      new Date(),
    );
    if (purchases.length === 0) return { activeTicketIds, purchasesByTicket };

    const tickets = await this.getTickets(production.getId!);
    for (const ticket of tickets) {
      const matching = purchases.filter(
        (purchase) =>
          purchase.ticket === ticket._id ||
          (purchase.target ?? null) === (ticket.target ?? null),
      );
      if (matching.length === 0) continue;
      activeTicketIds.add(ticket._id);
      purchasesByTicket.set(
        ticket._id,
        matching.map((purchase) => purchase._id),
      );
    }
    return { activeTicketIds, purchasesByTicket };
  }

  async buildViewerContext(
    production: Production,
    userId?: string | null,
    accessKey?: string | null,
  ): Promise<ProductionViewerContext> {
    return this.contextFor(production, await this.buildViewerScope(userId), {
      accessKey,
      includeTickets: true,
    });
  }

  /**
   * Condiciones de alcance para listar blogs (VIS-01): lo público, lo de
   * registrados, lo propio, lo de los grupos del visitante y lo que habilita
   * su agenda de contactos.
   */
  buildListVisibilityConditions(
    scope: ProductionViewerScope,
  ): Record<string, any>[] {
    if (!scope.userId) return [{ visibility: Visibility.public }];

    const conditions: Record<string, any>[] = [
      { visibility: { $in: [Visibility.public, Visibility.registered] } },
      {
        owner: new Types.ObjectId(scope.userId),
        ownerType: ProductionOwnerType.User,
      },
    ];
    scope.relationMap.forEach((levels, ownerId) => {
      if (levels.length === 0 || !Types.ObjectId.isValid(ownerId)) return;
      conditions.push({
        owner: new Types.ObjectId(ownerId),
        ownerType: ProductionOwnerType.User,
        visibility: { $in: levels },
      });
    });
    if (scope.groupRoles.size > 0) {
      conditions.push({
        owner: {
          $in: Array.from(scope.groupRoles.keys()).map(
            (id) => new Types.ObjectId(id),
          ),
        },
        ownerType: ProductionOwnerType.Group,
      });
    }
    return conditions;
  }

  evaluateProduction(
    production: Production,
    viewer: ProductionViewerContext,
  ): AccessDecision {
    return evaluateProductionAccess({
      productionId: production.getId!,
      moderationStatus: production.getModerationStatus,
      hasAccessKey: production.hasAccessKey,
      visibility: production.getVisibility!,
      viewer,
    });
  }

  // ---------------------------------------------------------------------------
  // Capas que se completan en las fases siguientes
  // ---------------------------------------------------------------------------

  /**
   * Acceso por clave (INV-01/02). Sin clave configurada el acceso es libre.
   * Con clave hace falta sesión: vale un acceso ya otorgado para la versión
   * vigente de la clave, o la clave que manda el visitante (que queda
   * registrada como acceso otorgado).
   */
  private async hasKeyAccess(
    production: Production,
    scope: ProductionViewerScope,
    accessKey?: string | null,
  ): Promise<boolean> {
    if (!production.hasAccessKey) return true;
    if (!scope.userId) return false;

    const grant = await this.grantRepository.find(
      production.getId!,
      scope.userId,
    );
    if (grant?.keyVersion === production.getAccessKeyVersion) return true;
    if (!accessKey) return false;

    const result = await this.tryAccessKey(production, scope.userId, accessKey);
    return result === 'granted';
  }

  /**
   * Valida una clave con límite de intentos por usuario y blog: tras
   * PRODUCTION_ACCESS_KEY_MAX_ATTEMPTS fallos se bloquea un rato, para que la
   * clave no se pueda adivinar por fuerza bruta.
   */
  private async tryAccessKey(
    production: Production,
    userId: string,
    accessKey: string,
  ): Promise<'granted' | 'invalid' | 'locked'> {
    const productionId = production.getId!;
    const grant = await this.grantRepository.find(productionId, userId);
    if (grant?.lockedUntil && grant.lockedUntil.getTime() > Date.now()) {
      return 'locked';
    }

    if (await verifyAccessKey(accessKey, production.getAccessKeyHash)) {
      await this.grantRepository.grant(
        productionId,
        userId,
        production.getAccessKeyVersion ?? 0,
      );
      return 'granted';
    }

    const lockUntil = new Date(
      Date.now() + getAccessKeyLockMinutes() * 60 * 1000,
    );
    const state = await this.grantRepository.registerFailure(
      productionId,
      userId,
      getAccessKeyMaxAttempts(),
      lockUntil,
    );
    this.logger.warn(
      `Clave incorrecta en la producción ${productionId} (usuario ${userId})`,
    );
    return state.lockedUntil && state.lockedUntil.getTime() > Date.now()
      ? 'locked'
      : 'invalid';
  }

  /** INV-01: el visitante ingresa la clave del blog. */
  async unlockWithKey(
    production: Production,
    userId: string | undefined,
    accessKey: string,
  ): Promise<void> {
    if (!production.hasAccessKey) return;
    if (!userId) {
      throw new UnauthorizedException(
        'Tenés que iniciar sesión para ingresar la clave',
      );
    }
    const result = await this.tryAccessKey(production, userId, accessKey);
    if (result === 'locked') {
      throw new ForbiddenException(
        `Demasiados intentos. Probá de nuevo en ${getAccessKeyLockMinutes()} minutos.`,
      );
    }
    if (result === 'invalid') {
      throw new BadRequestException('La clave es incorrecta');
    }
  }

  /**
   * REV-02: producción con una reseña pendiente por un ticket pago ya usado.
   * Mientras exista, el usuario no puede comprar tickets ni visitar otras
   * producciones.
   */
  private async findPendingReview(userId: string): Promise<string | null> {
    const pending = await this.purchaseRepository.findPendingReview(userId);
    return pending?.production ?? null;
  }

  /** De estas producciones, en cuáles el usuario es fan (FAN-01). */
  async findFanSet(
    userId: string | undefined,
    productionIds: string[],
  ): Promise<Set<string>> {
    if (!userId || productionIds.length === 0) return new Set();
    return this.communityRepository.findFanProductionIds(userId, productionIds);
  }

  /** Tickets del blog (TKT-01). */
  async getTickets(productionId: string): Promise<ProductionTicket[]> {
    return this.ticketRepository.findByProduction(productionId);
  }

  /**
   * Evalúa un ítem para el visitante cargando sus ancestros (herencia de
   * alcance y de ticket).
   */
  async evaluateItemById(
    production: Production,
    itemId: string,
    viewer: ProductionViewerContext,
  ): Promise<{ item: ProductionItem; decision: AccessDecision } | null> {
    const item = await this.itemRepository.findById(itemId);
    if (!item || item.getProduction !== production.getId) return null;
    const ancestors = await this.itemRepository.findAncestors(itemId);
    const decision = this.evaluateChain(
      production,
      [item, ...ancestors],
      await this.getTickets(production.getId!),
      viewer,
    );
    return { item, decision };
  }

  /** Decisión de acceso para un ítem y sus ancestros (del ítem a la raíz). */
  evaluateChain(
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

  /**
   * Registra que el visitante usó su ticket para ver contenido: desde ese
   * momento, si el ticket era pago, la reseña pasa a ser obligatoria (TKT-09).
   */
  async registerContentAccess(
    viewer: ProductionViewerContext,
    decision: AccessDecision,
  ): Promise<void> {
    if (!viewer.userId || !decision.ticketId) return;
    const purchaseIds = viewer.activePurchasesByTicket?.get(decision.ticketId);
    if (!purchaseIds?.length) return;
    await this.purchaseRepository.markFirstAccess(
      viewer.userId,
      purchaseIds,
      new Date(),
    );
  }

  /** Resumen del ticket que habilita un ítem, para mostrar la compra. */
  toTicketSummary(
    ticketId: string | undefined,
    tickets: TicketRef[],
  ): ProductionTicketSummaryResponse | null {
    if (!ticketId) return null;
    const ticket = (tickets as ProductionTicket[]).find(
      (candidate) => candidate._id === ticketId,
    );
    return ticket ? toTicketSummary(ticket) : null;
  }

  // ---------------------------------------------------------------------------
  // Límites
  // ---------------------------------------------------------------------------

  /** Límites del plan del creator del blog (GRP-08/RNF-14). */
  async getCreatorLimits(
    production: Production,
    session?: ClientSession,
  ): Promise<ProductionLimits> {
    return this.userService.getProductionLimitsFromUserByUserId(
      production.getCreator,
      session,
    );
  }
}
