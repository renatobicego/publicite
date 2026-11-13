export interface StartSubscriptionCheckoutCommand {
  /** id del plan en MercadoPago (preapproval_plan), el mismo que usa la URL del checkout. */
  mpPreapprovalPlanId: string;
  /** Token de la tarjeta que devuelve el Brick de MercadoPago. */
  cardTokenId: string;
  payerEmail: string;
  /** mpPreapprovalId del plan que se reemplaza, en un cambio de plan. */
  replacesSubscriptionId?: string | null;
}

export interface SubscriptionCheckoutResult {
  mpPreapprovalId: string;
  status: string;
  /** false si MP aceptó el pago pero no se pudo guardar: lo registra el webhook. */
  registered: boolean;
  /** En un cambio de plan: si se pudo cancelar el anterior. null si no hubo cambio. */
  previousSubscriptionCancelled: boolean | null;
  /** Aviso para el usuario cuando el alta salió bien pero algo quedó pendiente. */
  warning: string | null;
}

export interface MpCheckoutServiceInterface {
  startSubscriptionCheckout(
    userId: string,
    command: StartSubscriptionCheckoutCommand,
  ): Promise<SubscriptionCheckoutResult>;
  cancelMySubscription(userId: string, mpPreapprovalId: string): Promise<boolean>;
  updateMySubscriptionCard(
    userId: string,
    mpPreapprovalId: string,
    cardTokenId: string,
  ): Promise<boolean>;
}
