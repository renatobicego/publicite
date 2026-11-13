import Subscription from '../entity/subcription.entity';
import { SubscriptionKind } from 'src/contexts/module_shared/subscriptions/subscription.kind';

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
  /**
   * Cambio de plan: marca cancelado el plan viejo (ya cancelado en MP) y crea el
   * extra temporal con sus límites hasta su próximo cobro. Devuelve hasta cuándo.
   */
  cancelForPlanChange(previous: any, userId: string, now?: Date): Promise<Date | null>;
  /**
   * Alta de una suscripción de regalo o de Hacete Amigo: se agrega a
   * User.subscriptions de cada titular. Idempotente. Devuelve el _id.
   */
  createInternalSubscription(params: {
    mpPreapprovalId: string;
    subscriptionPlanId: string;
    holders: string[];
    payerUser: string;
    kind: SubscriptionKind;
    externalReference: string;
    status?: string;
    expiresAt?: Date;
    nextPaymentDate?: string;
    payerId?: string;
  }): Promise<string>;
  findSubscriptionByPreapprovalId(id: string): Promise<any>;
  createSubscription_preapproval(subscription_preapproval: any): Promise<void>;
  updateSubscription_preapproval(
    subscription_preapproval_update: any,
  ): Promise<void>;

  verifyIfSubscriptionWasPused(preapproval_id: string): Promise<boolean>;
  changeStatusOfSubscription(preapproval_id: string, status: string): Promise<void>;



}
