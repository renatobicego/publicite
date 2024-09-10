import { SubscriptionPlanResponse } from './HTTP-RESPONSE/SubscriptionPlan.response';

export interface MercadopagoSubscriptionPlanAdapterInterface {
  findAllSubscriptionPlans(): Promise<SubscriptionPlanResponse[]>;
}
