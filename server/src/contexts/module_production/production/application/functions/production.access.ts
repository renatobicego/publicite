import {
  ProductionLockReason,
  ProductionModerationStatus,
  ProductionRole,
} from '../../domain/entity/enum/production.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';
import { ProductionPermissions } from './production.roles';

/**
 * Evaluación de acceso de un visitante a un blog y a sus ítems.
 *
 * Capas, en orden (§4 de los ACs):
 * 1. Moderación: lo oculto o bloqueado no se muestra a quien no es staff (DEN-02).
 * 2. Reseña pendiente: bloquea visitar otras producciones (REV-02 / D10).
 * 3. Clave: si el blog tiene clave, REEMPLAZA al alcance (VIS-05 / INV-02).
 * 4. Alcance: Público / Registrados / Contactos / Amigos / Top amigos, con
 *    herencia y override por carpeta (VIS-01..04). Lo que queda fuera del
 *    alcance no se lista.
 * 5. Ticket: capa aparte (INV-03). El ítem se lista, pero su contenido queda
 *    bloqueado hasta tener un ticket activo (TKT-07).
 *
 * El staff del blog y los miembros del grupo (GRP-04..07) ven todo.
 */

export interface ProductionViewerContext {
  userId?: string;
  isRegistered: boolean;
  role: ProductionRole;
  /** Niveles de visibilidad que la relación con el dueño habilita. */
  relationVisibilities: string[];
  /** true si el blog no tiene clave, o si el visitante la validó. */
  hasKeyAccess: boolean;
  /** Tickets con un acceso activo del visitante. */
  activeTicketIds: Set<string>;
  /** id de la producción con reseña pendiente que bloquea al visitante. */
  pendingReviewProductionId?: string | null;
}

export interface TicketRef {
  _id: string;
  target: string | null;
}

export interface AccessDecision {
  /** Si el ítem aparece en el listado. */
  listed: boolean;
  /** Si se puede ver el contenido (key, bloques, dorso de la postal). */
  canViewContent: boolean;
  lockReason?: ProductionLockReason;
  /** Ticket que habilita el contenido, si aplica. */
  ticketId?: string;
}

/** ¿El visitante está dentro de este alcance? (VIS-01) */
export function isWithinVisibility(
  visibility: Visibility | string | null | undefined,
  viewer: Pick<ProductionViewerContext, 'isRegistered' | 'relationVisibilities'>,
): boolean {
  switch (visibility ?? Visibility.public) {
    case Visibility.public:
      return true;
    case Visibility.registered:
      return viewer.isRegistered;
    case Visibility.contacts:
    case Visibility.friends:
    case Visibility.topfriends:
      return (
        viewer.isRegistered &&
        viewer.relationVisibilities.includes(visibility as string)
      );
    default:
      return false;
  }
}

/**
 * Visibilidad efectiva de un ítem (VIS-03/04): la primera definida subiendo
 * desde el ítem hasta la raíz; si ninguna está definida, la del blog.
 *
 * @param chain visibilidades del ítem y sus ancestros, del ítem hacia la raíz.
 */
export function resolveEffectiveVisibility(
  chain: (Visibility | string | null | undefined)[],
  productionVisibility: Visibility | string | null | undefined,
): Visibility | string {
  const own = chain.find((value) => value !== null && value !== undefined);
  return own ?? productionVisibility ?? Visibility.public;
}

/**
 * Ticket efectivo de un ítem (TKT-01, modelo híbrido): el del ítem o el del
 * ancestro más cercano; si no hay, el ticket del blog completo (target null).
 *
 * @param chainIds ids del ítem y sus ancestros, del ítem hacia la raíz.
 */
export function resolveEffectiveTicket<T extends TicketRef>(
  chainIds: string[],
  tickets: T[],
): T | undefined {
  const byTarget = new Map<string | null, T>();
  tickets.forEach((ticket) => byTarget.set(ticket.target ?? null, ticket));
  for (const id of chainIds) {
    const ticket = byTarget.get(id);
    if (ticket) return ticket;
  }
  return byTarget.get(null);
}

export function isModerated(status?: ProductionModerationStatus | string) {
  return !!status && status !== ProductionModerationStatus.active;
}

/** Decisión a nivel blog: si el visitante puede entrar (antes de ver ítems). */
export function evaluateProductionAccess(params: {
  productionId: string;
  moderationStatus?: ProductionModerationStatus | string;
  hasAccessKey: boolean;
  visibility: Visibility | string;
  viewer: ProductionViewerContext;
}): AccessDecision {
  const { viewer } = params;

  if (ProductionPermissions.canViewAll(viewer.role)) {
    return { listed: true, canViewContent: true };
  }
  if (isModerated(params.moderationStatus)) {
    return {
      listed: false,
      canViewContent: false,
      lockReason: ProductionLockReason.moderation,
    };
  }
  if (
    viewer.pendingReviewProductionId &&
    viewer.pendingReviewProductionId !== params.productionId
  ) {
    return {
      listed: true,
      canViewContent: false,
      lockReason: ProductionLockReason.pendingReview,
    };
  }
  if (params.hasAccessKey) {
    return viewer.hasKeyAccess
      ? { listed: true, canViewContent: true }
      : {
          listed: true,
          canViewContent: false,
          lockReason: ProductionLockReason.accessKey,
        };
  }
  if (!isWithinVisibility(params.visibility, viewer)) {
    return {
      listed: false,
      canViewContent: false,
      lockReason: ProductionLockReason.visibility,
    };
  }
  return { listed: true, canViewContent: true };
}

/** Decisión a nivel ítem, asumiendo que el visitante ya pudo entrar al blog. */
export function evaluateItemAccess(params: {
  production: {
    _id: string;
    visibility: Visibility | string;
    hasAccessKey: boolean;
  };
  /** Ítem y ancestros, del ítem hacia la raíz. */
  chain: {
    _id: string;
    visibility?: Visibility | string | null;
    moderationStatus?: ProductionModerationStatus | string;
  }[];
  tickets: TicketRef[];
  viewer: ProductionViewerContext;
}): AccessDecision {
  const { production, chain, tickets, viewer } = params;

  if (ProductionPermissions.canViewAll(viewer.role)) {
    return { listed: true, canViewContent: true };
  }
  if (chain.some((node) => isModerated(node.moderationStatus))) {
    return {
      listed: false,
      canViewContent: false,
      lockReason: ProductionLockReason.moderation,
    };
  }

  // Con clave, el alcance no se evalúa (VIS-05): la clave ya se validó al
  // entrar al blog.
  if (!production.hasAccessKey) {
    const visibility = resolveEffectiveVisibility(
      chain.map((node) => node.visibility),
      production.visibility,
    );
    if (!isWithinVisibility(visibility, viewer)) {
      return {
        listed: false,
        canViewContent: false,
        lockReason: ProductionLockReason.visibility,
      };
    }
  }

  const ticket = resolveEffectiveTicket(
    chain.map((node) => node._id),
    tickets,
  );
  if (ticket && !viewer.activeTicketIds.has(ticket._id)) {
    return {
      listed: true,
      canViewContent: false,
      lockReason: ProductionLockReason.ticket,
      ticketId: ticket._id,
    };
  }

  return { listed: true, canViewContent: true, ticketId: ticket?._id };
}
