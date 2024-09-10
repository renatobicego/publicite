import { SubscriptionResponse } from 'src/contexts/webhook/application/mercadopago/adapter/HTTP-RESPONSE/subscription.response';

export interface SubscriptionRepositoryInterface {
  getSubscriptionByEmail(
    subID: string,
    email: string,
  ): Promise<SubscriptionResponse[]>;
  getActiveSubscriptionByEmail(
    email: string,
  ): Promise<SubscriptionResponse | null>;
}
