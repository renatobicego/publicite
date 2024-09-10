import Subscription from '../entity/subcription.entity';

export interface SubscriptionRepositoryInterface {
  getSubscriptionHistory(external_reference: string): Promise<Subscription[]>;
}
