import Subscription from '../entity/subcription.entity';

export interface SubscriptionServiceInterface {
  getSubscriptionHistory(external_reference: string): Promise<Subscription[]>;
}
