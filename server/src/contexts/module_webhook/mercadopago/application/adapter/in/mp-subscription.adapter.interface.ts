import { SubscriptionResponse } from '../HTTP-RESPONSE/subscription.response';

export interface SubscriptionAdapterInterface {
  getSubscriptionHistory(
    external_reference: string,
  ): Promise<SubscriptionResponse[]>;
}
