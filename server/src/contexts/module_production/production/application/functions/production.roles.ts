import {
  ProductionOwnerType,
  ProductionRole,
} from '../../domain/entity/enum/production.enums';

/**
 * Roles del blog (GRP-04..07, RNF-12). No se persisten: se derivan del dueño
 * del blog y, en blogs de grupo, de las listas que ya tiene el grupo.
 *
 * - Blog personal: el dueño es `admin`; el resto, `visitor`.
 * - Blog de grupo: `creator` → admin, `admins[]` → moderator,
 *   `members[]` → viewer (sólo lectura); el resto, `visitor`.
 */

export interface GroupRoster {
  creator?: any;
  admins?: any[];
  members?: any[];
}

const toId = (value: any): string | undefined =>
  value?._id?.toString() ?? value?.toString();

export function resolveProductionRole(params: {
  userId?: string | null;
  ownerType: ProductionOwnerType;
  ownerId: string;
  group?: GroupRoster | null;
}): ProductionRole {
  const { userId, ownerType, ownerId, group } = params;
  if (!userId) return ProductionRole.visitor;

  if (ownerType === ProductionOwnerType.User) {
    return ownerId === userId ? ProductionRole.admin : ProductionRole.visitor;
  }

  if (!group) return ProductionRole.visitor;
  if (toId(group.creator) === userId) return ProductionRole.admin;
  if ((group.admins ?? []).some((admin) => toId(admin) === userId)) {
    return ProductionRole.moderator;
  }
  if ((group.members ?? []).some((member) => toId(member) === userId)) {
    return ProductionRole.viewer;
  }
  return ProductionRole.visitor;
}

/** Admin o moderador: operan el contenido del blog. */
const STAFF = new Set([ProductionRole.admin, ProductionRole.moderator]);

/** Staff + miembros del grupo: ven todo el contenido compartido. */
const MEMBERS = new Set([
  ProductionRole.admin,
  ProductionRole.moderator,
  ProductionRole.viewer,
]);

export const ProductionPermissions = {
  /** Ve todo el contenido sin alcance, clave ni ticket. */
  canViewAll: (role: ProductionRole) => MEMBERS.has(role),
  /** Carpetas, archivos, artículos y datos del header (GRP-05/06). */
  canEditContent: (role: ProductionRole) => STAFF.has(role),
  /** Tickets, visibilidad y clave de acceso (GRP-06: tickets e invitaciones). */
  canManageAccess: (role: ProductionRole) => STAFF.has(role),
  /** Operaciones masivas de la SeudoBase. */
  canBulkEdit: (role: ProductionRole) => STAFF.has(role),
  /** Listado de fans y datos de consumo del blog. */
  canViewInsights: (role: ProductionRole) => STAFF.has(role),
  /** Sólo el admin borra el blog (el moderador no crea ni borra). */
  canDeleteBlog: (role: ProductionRole) => role === ProductionRole.admin,
  /** Sólo el admin cobra: es quien carga el alias/CBU (GRP-05/06). */
  canManagePayout: (role: ProductionRole) => role === ProductionRole.admin,
};
