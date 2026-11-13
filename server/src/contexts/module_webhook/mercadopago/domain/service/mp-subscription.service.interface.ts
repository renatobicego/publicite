import Subscription from '../entity/subcription.entity';

export enum statusOfSubscription {
  AUTHORIZED = 'authorized',
  PENDING = 'pending',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}
export interface SubscriptionServiceInterface {
  getSubscriptionHistory(userId: string): Promise<Subscription[]>;
  /** Activas de las que el usuario es titular (incluye el gratuito), con el plan populado. */
  getActiveSubscriptions(userId: string): Promise<any[]>;
  /** Activas que no son el plan gratuito (planes, packs, temporales, compartidas, regaladas). */
  getActivePaidSubscriptions(userId: string): Promise<any[]>;
  /** ¿Tiene un plan pago? (no gratuito, no pack, no el extra temporal de cambio de plan). */
  hasPaidPlan(userId: string): Promise<boolean>;
  /** Activas con preapproval en MP que paga el usuario (para el borrado de cuenta). */
  getActiveMpSubscriptionsPaidBy(userId: string): Promise<any[]>;
  cancelSubscriptionInDb(mpPreapprovalId: string): Promise<void>;
  findSubscriptionByPreapprovalId(id: string): Promise<any>;
  createSubscription_preapproval(subscription_preapproval: any): Promise<void>;
  updateSubscription_preapproval(
    subscription_preapproval_update: any,
  ): Promise<void>;

  verifyIfSubscriptionWasPused(preapproval_id: string): Promise<boolean>;
  changeStatusOfSubscription(preapproval_id: string, status: string): Promise<void>;



}
