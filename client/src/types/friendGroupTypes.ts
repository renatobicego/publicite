export type FriendGroupStatus =
  | "forming"
  | "paying"
  | "active"
  | "paymentFailed"
  | "cancelled";

export interface FriendPlanTier {
  members: number;
  discountPercent: number;
  /** Lo que paga cada uno por mes. */
  pricePerMember: number;
  /** Lo que se debita por mes (todos). */
  totalAmount: number;
}

export interface FriendPlanOption {
  mpPreapprovalPlanId: string;
  planReason: string;
  planAmount: number;
  tiers: FriendPlanTier[];
}

export interface FriendPlanOptions {
  plans: FriendPlanOption[];
  minMembers: number;
  /** 0 = sin tope. */
  maxMembers: number;
}

export interface FriendGroupMember {
  userId: string;
  name: string | null;
  username: string | null;
  profilePhotoUrl: string | null;
  status: "invited" | "accepted";
  /** Publicó al menos un anuncio o una producción. */
  isActivated: boolean;
  isCreator: boolean;
  isPayer: boolean;
}

export interface FriendGroupPricing {
  memberCount: number;
  discountPercent: number;
  planAmount: number;
  pricePerMember: number;
  totalAmount: number;
}

export interface FriendGroup {
  _id: string;
  status: FriendGroupStatus;
  planReason: string;
  mpPreapprovalPlanId: string;
  isCreator: boolean;
  isPayer: boolean;
  inviteCode: string | null;
  members: FriendGroupMember[];
  pricing: FriendGroupPricing | null;
  nextTier: FriendPlanTier | null;
  canPay: boolean;
  payBlockedReason: string | null;
  payerName: string | null;
  /** Sólo para quien paga: para cambiar la tarjeta. */
  mpPreapprovalId: string | null;
  cancelReason: string | null;
  activatedAt: string | null;
  paymentFailedAt: string | null;
}

export interface FriendGroupInvitation {
  groupId: string;
  planReason: string;
  invitedByName: string | null;
  acceptedCount: number;
  tierIfJoins: FriendPlanTier | null;
}

export interface MyFriendGroup {
  group: FriendGroup | null;
  invitations: FriendGroupInvitation[];
}

export interface FriendGroupPublic {
  planReason: string;
  creatorName: string | null;
  acceptedCount: number;
  availability: "open" | "closed" | "full";
  isMember: boolean;
  tierIfJoins: FriendPlanTier | null;
}

export const FRIEND_GROUP_STATUS_LABEL: Record<FriendGroupStatus, string> = {
  forming: "Armando el grupo",
  paying: "Procesando el débito",
  active: "Plan activo",
  paymentFailed: "Cobro rechazado",
  cancelled: "Cancelado",
};

export const FRIEND_GROUP_STATUS_COLOR: Record<
  FriendGroupStatus,
  "default" | "primary" | "success" | "warning" | "danger"
> = {
  forming: "primary",
  paying: "warning",
  active: "success",
  paymentFailed: "danger",
  cancelled: "default",
};

export const FRIEND_PLAN_WELCOME =
  "Armá tu grupo y pagá menos. De a 4, pagan 3 y rinden 4. Uno paga por todos con débito automático y se olvidan de los vencimientos.";

export const money = (value: number) =>
  `$${value.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;
