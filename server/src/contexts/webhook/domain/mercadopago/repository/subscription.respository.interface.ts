import { SubscriptionResponse } from 'src/contexts/webhook/infraestructure/controllers/response/subscription.response';

export interface SubscriptionRepositoryInterface {
  getSubscriptionByEmail(
    subID: string,
    email: string,
  ): Promise<SubscriptionResponse[]>;
  getActiveSubscriptionByEmail(
    email: string,
  ): Promise<SubscriptionResponse | null>;
}
