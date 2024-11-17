import { Inject } from '@nestjs/common';

import { SubscriptionPlanResponse } from 'src/contexts/module_webhook/mercadopago/application/adapter/HTTP-RESPONSE/SubscriptionPlan.response';
import { MercadopagoSubscriptionPlanAdapterInterface } from 'src/contexts/module_webhook/mercadopago/application/adapter/in/mp-subscriptionPlan.adapter.interface';
import { SubscriptionPlan } from 'src/contexts/module_webhook/mercadopago/domain/entity/subscriptionPlan.entity';
import { MercadoPagoSubscriptionPlanServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-subscriptionPlan.service.interface';

export class MercadoPagoSubscriptionPlanAdapter
  implements MercadopagoSubscriptionPlanAdapterInterface
{
  constructor(
    @Inject('MercadoPagoSubscriptionPlanServiceInterface')
    private readonly subscriptionService: MercadoPagoSubscriptionPlanServiceInterface,
  ) {}
  async findAllSubscriptionPlans(): Promise<SubscriptionPlanResponse[]> {
    try {
      const subscriptionPlans =
        await this.subscriptionService.findAllSubscriptionPlans();
      return subscriptionPlans.map((subscriptionPlan) => {
        return SubscriptionPlan.formatEntityToResponse(subscriptionPlan);
      });
    } catch (error: any) {
      throw error;
    }
  }
}
