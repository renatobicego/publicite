import Subscription from '../entity/subcription.entity';

export enum statusOfSubscription {
  AUTHORIZED = 'authorized',
  PENDING = 'pending',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}
export interface SubscriptionServiceInterface {
  getSubscriptionHistory(external_reference: string): Promise<Subscription[]>;
  findSubscriptionByPreapprovalId(id: string): Promise<Subscription | null>;
  createSubscription_preapproval(subscription_preapproval: any): Promise<void>;
  updateSubscription_preapproval(
    subscription_preapproval_update: any,
  ): Promise<void>;

  verifyIfSubscriptionWasPused(preapproval_id: string): Promise<boolean>;
  changeStatusOfSubscription(preapproval_id: string, status: string): Promise<void>;



}
