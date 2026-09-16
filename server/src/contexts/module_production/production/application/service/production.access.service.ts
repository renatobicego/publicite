import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientSession } from 'mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { PubliciteAuth } from 'src/contexts/module_shared/auth/publicite_auth/publicite_auth';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';
import { ProductionLimits } from 'src/contexts/module_user/user/application/functions/calculateProductionLimits';
import { makeUserRelationHierarchyMap } from 'src/contexts/module_shared/utils/functions/makeUserRelationHierarchyMap';
import { Production } from '../../domain/entity/production.entity';
import {
  ProductionOwnerType,
  ProductionRole,
} from '../../domain/entity/enum/production.enums';
import { ProductionRepositoryInterface } from '../../domain/repository/production.repository.interface';
import {
  AccessDecision,
  evaluateProductionAccess,
  ProductionViewerContext,
  TicketRef,
} from '../functions/production.access';
import {
  ProductionPermissions,
  resolveProductionRole,
} from '../functions/production.roles';
import { verifyAccessKey } from '../functions/production.access-key';
import { ProductionTicketSummaryResponse } from '../../domain/entity/models_graphql/HTTP-RESPONSE/production.response';

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
  ) {}

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

  /** Contexto del visitante para evaluar alcance, clave, tickets y reseñas. */
  async buildViewerContext(
    production: Production,
    userId?: string | null,
    accessKey?: string | null,
  ): Promise<ProductionViewerContext> {
    const role = await this.resolveRole(production, userId);
    return {
      userId: userId ?? undefined,
      isRegistered: !!userId,
      role,
      relationVisibilities: await this.getRelationVisibilities(
        production,
        userId,
        role,
      ),
      hasKeyAccess: await this.hasKeyAccess(production, accessKey),
      activeTicketIds: new Set<string>(),
      pendingReviewProductionId: null,
    };
  }

  /**
   * Acceso por clave (INV-01/02). Sin clave configurada, el acceso es libre;
   * con clave, se valida la que manda el visitante contra el hash guardado.
   */
  private async hasKeyAccess(
    production: Production,
    accessKey?: string | null,
  ): Promise<boolean> {
    if (!production.hasAccessKey) return true;
    return verifyAccessKey(accessKey, production.getAccessKeyHash);
  }

  /** Datos del visitante que dependen de otras capas (fans, reseñas). */
  async getViewerExtras(
    _production: Production,
    _viewer: ProductionViewerContext,
  ): Promise<{ isFan?: boolean; rating?: number | null; reviewsCount?: number | null }> {
    return {};
  }

  /** Registra que el visitante efectivamente usó su acceso al contenido. */
  async registerContentAccess(
    _viewer: ProductionViewerContext,
    _decision: AccessDecision,
  ): Promise<void> {
    return;
  }

  /** Resumen del ticket que habilita un ítem, para mostrar la compra. */
  toTicketSummary(
    _ticketId: string | undefined,
    _tickets: TicketRef[],
  ): ProductionTicketSummaryResponse | null {
    return null;
  }

  /**
   * Niveles de la agenda de contactos que el visitante tiene con el dueño
   * (VIS-01). Reutiliza el mismo mapa de relaciones activas que Anuncios. En
   * blogs de grupo no hay agenda: el contenido se comparte con los miembros.
   */
  private async getRelationVisibilities(
    production: Production,
    userId: string | null | undefined,
    role: ProductionRole,
  ): Promise<string[]> {
    if (
      !userId ||
      role !== ProductionRole.visitor ||
      production.getOwnerType !== ProductionOwnerType.User
    ) {
      return [];
    }
    const activeRelations =
      await this.userService.getActiveRelationOfUser(userId);
    if (!activeRelations || activeRelations.length === 0) return [];
    const relationMap = makeUserRelationHierarchyMap(activeRelations, userId);
    return relationMap.get(production.getOwner) ?? [];
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

  /** Tickets vigentes del blog. */
  async getTickets(_productionId: string): Promise<TicketRef[]> {
    return [];
  }

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
