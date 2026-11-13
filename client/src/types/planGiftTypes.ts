/** Estados de un regalo de plan. `expired` lo calcula el server al leer. */
export type PlanGiftStatus =
  | "pendingPayment"
  | "paid"
  | "active"
  | "expired"
  | "rejected"
  | "refunded";

export interface PlanGiftQuote {
  amount: number;
  planReason: string;
  months: number;
  monthOptions: number[];
}

export interface PlanGift {
  _id: string;
  code: string;
  planReason: string;
  months: number;
  amount: number;
  status: PlanGiftStatus;
  giverName: string | null;
  recipientName: string | null;
  /** Sólo lo ve quien regala (y el admin). */
  recipientEmail: string | null;
  canActivate: boolean;
  /** Link relativo para compartir: /canjear/<código>. */
  link: string;
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string | null;
}

export interface AdminPlanGift extends PlanGift {
  giverEmail: string | null;
  mpPaymentId: string | null;
  paymentStatus: string | null;
}

/** Lo que muestra el link /canjear/<código>, con datos mínimos. */
export interface PlanGiftPublic {
  code: string;
  planReason: string;
  months: number;
  giverName: string | null;
  availability: "available" | "used" | "unavailable";
  /** Email al que está reservado, enmascarado (ma***@gmail.com). */
  reservedForEmail: string | null;
  isForViewer: boolean;
  giftId: string | null;
}

export interface BuyPlanGiftResult {
  giftId: string;
  code: string;
  status: PlanGiftStatus;
  recipientHasAccount: boolean;
  link: string;
  message: string;
}

export interface BuyPlanGiftInput {
  mpPreapprovalPlanId: string;
  months: number;
  recipientUserId?: string;
  recipientEmail?: string;
  cardTokenId: string;
  paymentMethodId: string;
  issuerId?: string;
  payerEmail: string;
  identificationType?: string;
  identificationNumber?: string;
}

export const PLAN_GIFT_STATUS_LABEL: Record<PlanGiftStatus, string> = {
  pendingPayment: "Pago en proceso",
  paid: "Listo para activar",
  active: "Activo",
  expired: "Terminado",
  rejected: "Pago rechazado",
  refunded: "Devuelto",
};

export const PLAN_GIFT_STATUS_COLOR: Record<
  PlanGiftStatus,
  "default" | "primary" | "success" | "warning" | "danger"
> = {
  pendingPayment: "warning",
  paid: "primary",
  active: "success",
  expired: "default",
  rejected: "danger",
  refunded: "default",
};

export const monthsLabel = (months: number) =>
  `${months} ${months === 1 ? "mes" : "meses"}`;
