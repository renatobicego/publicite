import { SubscriptionResponse } from 'src/contexts/webhook/infraestructure/controllers/response/subscription.response';

export interface SubscriptionServiceInterface {
  getSubscriptionByEmail(
    subID: string,
    email: string,
  ): Promise<SubscriptionResponse[]>;
}
