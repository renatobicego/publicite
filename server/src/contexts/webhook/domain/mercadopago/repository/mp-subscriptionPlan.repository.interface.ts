import { SubscriptionPlan } from '../entity/subscriptionPlan.entity';

export interface MercadoPagoSubscriptionPlanRepositoryInterface {
  findAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
}
