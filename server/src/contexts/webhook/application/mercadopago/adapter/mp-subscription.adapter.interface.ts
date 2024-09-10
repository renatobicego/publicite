import { SubscriptionResponse } from './HTTP-RESPONSE/subscription.response';

export interface SubscriptionAdapterInterface {
  getSubscriptionsByEmail(
    subID: string,
    email: string,
  ): Promise<SubscriptionResponse[]>;
  getActiveSubscriptionByEmail(
    email: string,
  ): Promise<SubscriptionResponse | null>;
}
