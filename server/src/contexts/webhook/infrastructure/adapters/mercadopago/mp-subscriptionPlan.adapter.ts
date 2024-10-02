import { Inject } from '@nestjs/common';
import { SubscriptionPlanResponse } from 'src/contexts/webhook/application/mercadopago/adapter/HTTP-RESPONSE/SubscriptionPlan.response';
import { MercadopagoSubscriptionPlanAdapterInterface } from 'src/contexts/webhook/application/mercadopago/adapter/mp-subscriptionPlan.adapter.interface';
import { SubscriptionPlan } from 'src/contexts/webhook/domain/mercadopago/entity/subscriptionPlan.entity';
import { MercadoPagoSubscriptionPlanServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-subscriptionPlan.service.interface';

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
