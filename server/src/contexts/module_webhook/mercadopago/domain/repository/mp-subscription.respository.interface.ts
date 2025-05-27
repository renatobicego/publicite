import Subscription from '../../../mercadopago/domain/entity/subcription.entity';

export interface SubscriptionRepositoryInterface {
  getSubscriptionHistory(external_reference: string): Promise<any[]>;
  getActiveSubscriptions(external_reference: string): Promise<any[]>;
  findSubscriptionByPreapprovalId(id: string): Promise<any>;
  saveSubPreapproval(sub: Subscription, session: any): Promise<void>;
  updateSubscription(id: string, updateObject: any): Promise<void>;
  updateSubscriptionStatus(id: string, statusObj: any): Promise<void>;
  cancelSubscription(id: string): Promise<void>;
  pauseSubscription(id: string, updateObject: any): Promise<void>;
  pendingSubscription(id: string, updateObject: any): Promise<void>;
  verifyIfSubscriptionWasPused(preapproval_id: string): Promise<boolean>;
}
