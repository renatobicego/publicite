import { Inject, InternalServerErrorException } from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { SubscriptionPlan } from 'src/contexts/module_webhook/domain/mercadopago/entity/subscriptionPlan.entity';
import { MercadoPagoSubscriptionPlanRepositoryInterface } from 'src/contexts/module_webhook/domain/mercadopago/repository/mp-subscriptionPlan.repository.interface';
import { MercadoPagoSubscriptionPlanServiceInterface } from 'src/contexts/module_webhook/domain/mercadopago/service/mp-subscriptionPlan.service.interface';

export class MercadoPagoSubscriptionPlanService
  implements MercadoPagoSubscriptionPlanServiceInterface
{
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('MercadoPagoSubscriptionPlanRepositoryInterface')
    private readonly subscriptionPlanRepository: MercadoPagoSubscriptionPlanRepositoryInterface,
  ) {}
  async findSubscriptionPlanByMeliID(
    id: string,
  ): Promise<SubscriptionPlan | null> {
    try {
      const subscriptionPlan =
        this.subscriptionPlanRepository.findSubscriptionPlanByMeliID(id);
      if (!subscriptionPlan) return Promise.resolve(null);
      return subscriptionPlan;
    } catch (error: any) {
      throw error;
    }
  }
  async findAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const subscriptionPlans =
        await this.subscriptionPlanRepository.findAllSubscriptionPlans();
      return subscriptionPlans;
    } catch (error: any) {
      this.logger.error(
        'An error has ocurred while fetching subscription plans: ' + error,
      );
      throw new InternalServerErrorException(error);
    }
  }
}
