import { Controller, Get, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { MercadopagoSubscriptionPlanAdapterInterface } from '../../application/adapter/in/mp-subscriptionPlan.adapter.interface';
import { SubscriptionPlanResponse } from '../../application/adapter/HTTP-RESPONSE/SubscriptionPlan.response';

@ApiTags('SubscriptionPlans')
@Controller('subscriptionplans')
export class MercadopagoSubscriptionPlanController {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('MercadopagoSubscriptionPlanAdapterInterface')
    private readonly subscriptionPlanAdapter: MercadopagoSubscriptionPlanAdapterInterface,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Return all subscriptions Plans.' })
  @ApiResponse({
    status: 200,
    description: 'Return all subscriptions Plans.',
    type: [SubscriptionPlanResponse],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
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
