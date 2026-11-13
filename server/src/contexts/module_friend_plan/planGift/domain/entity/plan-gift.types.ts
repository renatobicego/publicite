/**
 * Regalo de planes: quien regala paga una sola vez N meses de un plan y el
 * regalo queda asignado a una cuenta (o a un email, para quien todavía no tiene
 * cuenta). Los meses empiezan a contar cuando el destinatario lo activa.
 */
export enum PlanGiftStatus {
  /** Se creó el regalo y MP todavía no aprobó el pago. */
  pendingPayment = 'pendingPayment',
  /** Pagado: espera que el destinatario lo active. */
  paid = 'paid',
  /** Activado: el destinatario tiene el plan hasta `expiresAt`. */
  active = 'active',
  /** MP rechazó el pago. */
  rejected = 'rejected',
  /** El pago se devolvió (lo hace el admin desde MP). */
  refunded = 'refunded',
}

export interface PlanGiftRecord {
  _id: any;
  code: string;
  giver: any;
  recipient: any | null;
  recipientEmail: string | null;
  subscriptionPlan: any;
  mpPreapprovalPlanId: string;
  planReason: string;
  months: number;
  amount: number;
  status: PlanGiftStatus;
  mpPaymentId: string | null;
  paymentStatus: string | null;
  paymentStatusDetail: string | null;
  activatedAt: Date | null;
  expiresAt: Date | null;
  subscription: any | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlanGiftUserRef {
  _id: any;
  name?: string;
  lastName?: string;
  username?: string;
  email?: string;
}
