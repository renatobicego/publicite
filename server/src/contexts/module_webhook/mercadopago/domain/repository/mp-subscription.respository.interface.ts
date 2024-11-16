import Subscription from '../../../mercadopago/domain/entity/subcription.entity';

export interface SubscriptionRepositoryInterface {
  getSubscriptionHistory(external_reference: string): Promise<Subscription[]>;
  findSubscriptionByPreapprovalId(id: string): Promise<Subscription | null>;
  saveSubPreapproval(sub: Subscription): Promise<void>;
  updateSubscription(id: string, updateObject: any): Promise<void>;
  cancelSubscription(id: string): Promise<void>;
  pauseSubscription(id: string, updateObject: any): Promise<void>;
}
