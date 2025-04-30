import { Controller, Get, HttpCode, HttpStatus, Inject } from '@nestjs/common';


import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { MercadopagoSubscriptionPlanAdapterInterface } from '../../application/adapter/in/mp-subscriptionPlan.adapter.interface';
import { SubscriptionPlanResponse } from '../../application/adapter/HTTP-RESPONSE/SubscriptionPlan.response';


@Controller('subscriptionplans')
export class MercadopagoSubscriptionPlanController {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('MercadopagoSubscriptionPlanAdapterInterface')
    private readonly subscriptionPlanAdapter: MercadopagoSubscriptionPlanAdapterInterface,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllSubscriptionsController(): Promise<SubscriptionPlanResponse[]> {
    try {
      this.logger.log(`Searching All subscriptions`);
      return await this.subscriptionPlanAdapter.findAllSubscriptionPlans();
    } catch (error: any) {
      this.logger.error(error.message ?? '');
      throw error;
    }
  }
}
