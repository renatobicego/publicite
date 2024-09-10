import { SubscriptionPlan } from '../entity/subscriptionPlan.entity';

export interface MercadoPagoSubscriptionPlanServiceInterface {
  findAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
}
