export interface SubscriptionPlan {
  _id: ObjectId;
  reason: string;
  description: string;
  price: number;
  features: string[];
  isFree?: boolean;
  intervalTime: number;
  isActive: boolean;
  mpPreapprovalPlanId: string;
  isPack: boolean;
  postsLibresCount: number;
  postsAgendaCount: number;
  /** Tokens Publicité de IA por mes que otorga el plan (lo calcula el BE desde env) */
  aiTokensPerMonth?: number;
  /**
   * Almacenamiento de Mis Producciones en bytes (por usuario). Sólo viene si el
   * límite de almacenamiento está activo en el BE.
   */
  storageBytesLimit?: number;
}

/**
 * Tipo de suscripción:
 * - mp: suscripción de MercadoPago del usuario (lo de siempre);
 * - carryover: extra temporal al cambiar de plan (límites del plan viejo hasta `expiresAt`);
 * - friendGroup: plan compartido de Hacete Amigo;
 * - gift: plan regalado (meses prepagos hasta `expiresAt`).
 * Las anteriores al campo no lo traen y son `mp`.
 */
export type SubscriptionKind = "mp" | "carryover" | "friendGroup" | "gift";

export interface Subscription {
  _id: ObjectId;
  payerId: string;
  status: "active" | "cancelled" | "paused" | "authorized" | "pending";
  mpPreapprovalId: string;
  startDate: string;
  endDate: string;
  nextPaymentDate: string;
  subscriptionPlan: SubscriptionPlan;
  external_reference: string;
  kind?: SubscriptionKind;
  /** Sólo en las temporales (extra de cambio de plan, regalo). */
  expiresAt?: string;
  /** mongoId de quien paga, cuando no es el titular (regalo, Hacete Amigo). */
  payerUser?: string;
}

export interface SubscriptionCheckoutResult {
  mpPreapprovalId: string;
  status: string;
  /** false si MercadoPago cobró pero la suscripción todavía no quedó guardada. */
  registered: boolean;
  /** En un cambio de plan: si se dio de baja el anterior. null si no hubo cambio. */
  previousSubscriptionCancelled: boolean | null;
  /** Aviso para mostrar al usuario. */
  warning: string | null;
}

export interface Invoice {
  _id: string;
  transactionAmount: Number;
  paymentStatus: string;
  nextRetryDay: string;
  timeOfUpdate: string;
  status: string;
  reason: string;
  retryAttempts: string;
  rejectionCode: string;
  paymentId: PaymentMethod;
}

export interface PaymentMethod {
  _id: ObjectId;
  paymentMethodId: string;
  paymentTypeId: string;
  transactionAmount: number;
  timeOfUpdate: string;
  status_detail: string;
  status: string;
}

export interface PaymentNotificationType extends BaseNotification {
  frontData: {
    subscriptionPlan: {
      _id: ObjectId;
      reason: string;
      status: "pending" | "approved" | "rejected";
      retryAttemp: number;
    };
  };
}

export type PaymentStatusNotificationType =
  | "payment_pending"
  | "payment_approved"
  | "payment_rejected"
  | "subscription_cancelled"
  | "free_trial";

export interface SubscriptionNotification extends BaseNotification {
  frontData: {
    subscription: {
      event: SubscriptionEvent;
    };
  };
}

export type SubscriptionEvent =
  | "notification_downgrade_plan_contact"
  | "notification_downgrade_plan_post";
