/**
 * Hacete Amigo: un grupo propio del plan (no es el `Group` de la app) donde uno
 * paga por todos un solo débito automático con descuento por cantidad.
 *
 * Ciclo: forming -> paying -> active <-> paymentFailed -> cancelled.
 * - forming: se arma; se invita, se acepta, se sale libremente.
 * - paying: se está dando de alta el débito en MP (o MP respondió pendiente).
 * - active: el plan compartido está activo. El grupo queda fijo.
 * - paymentFailed: MP rechazó un cobro; se reintenta. Si vuelve a cobrar, active.
 * - cancelled: alguien se bajó, MP no pudo cobrar o se canceló el débito.
 */
export enum FriendGroupStatus {
  forming = 'forming',
  paying = 'paying',
  active = 'active',
  paymentFailed = 'paymentFailed',
  cancelled = 'cancelled',
}

/** Grupos "vivos": un usuario sólo puede estar aceptado en uno de estos. */
export const LIVE_FRIEND_GROUP_STATUSES: FriendGroupStatus[] = [
  FriendGroupStatus.forming,
  FriendGroupStatus.paying,
  FriendGroupStatus.active,
  FriendGroupStatus.paymentFailed,
];

/** Grupos con débito en MP (pagando, activo o con un cobro rechazado). */
export const PAID_FRIEND_GROUP_STATUSES: FriendGroupStatus[] = [
  FriendGroupStatus.paying,
  FriendGroupStatus.active,
  FriendGroupStatus.paymentFailed,
];

export enum FriendGroupMemberStatus {
  invited = 'invited',
  accepted = 'accepted',
}

export interface FriendGroupMember {
  user: any;
  status: FriendGroupMemberStatus;
  invitedBy?: any;
  invitedAt?: Date | null;
  joinedAt?: Date | null;
}

export interface FriendGroupPausedPosts {
  user: any;
  posts: any[];
}

export interface FriendGroupRecord {
  _id: any;
  creator: any;
  subscriptionPlan: any;
  mpPreapprovalPlanId: string;
  planReason: string;
  members: FriendGroupMember[];
  payer: any | null;
  inviteCode: string;
  status: FriendGroupStatus;
  // Lo que se cobró (se congela al pagar).
  memberCount: number | null;
  discountPercent: number | null;
  planAmount: number | null;
  pricePerMember: number | null;
  totalAmount: number | null;
  mpPreapprovalId: string | null;
  subscription: any | null;
  cancelReason: string | null;
  activatedAt: Date | null;
  paymentFailedAt: Date | null;
  /** Anuncios que apagó el downgrade del cobro rechazado: vuelven si se recupera. */
  pausedPosts?: FriendGroupPausedPosts[];
  cancelledAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Datos de un usuario para mostrar en el grupo y saber si ya publicó algo. */
export interface FriendGroupUserRef {
  _id: any;
  name?: string;
  lastName?: string;
  username?: string;
  businessName?: string;
  profilePhotoUrl?: string;
  postsCount: number;
  productionsCount: number;
}
