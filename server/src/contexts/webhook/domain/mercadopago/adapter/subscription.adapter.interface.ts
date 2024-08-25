import { SubscriptionResponse } from 'src/contexts/webhook/infraestructure/controllers/response/subscription.response';

export interface SubscriptionAdapterInterface {
  getSubscriptionByEmail(
    subID: string,
    email: string,
  ): Promise<SubscriptionResponse[]>;
}
