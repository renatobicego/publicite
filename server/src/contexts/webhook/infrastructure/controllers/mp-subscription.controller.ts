import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
} from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { SubscriptionAdapterInterface } from '../../application/mercadopago/adapter/mp-subscription.adapter.interface';
import { SubscriptionResponse } from '../../application/mercadopago/adapter/HTTP-RESPONSE/subscription.response';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('My Subscriptions')
@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('SubscriptionAdapterInterface')
    private readonly subscriptionAdapter: SubscriptionAdapterInterface,
  ) {}

  @Get(':clerkId')
  @ApiOperation({ summary: 'Get subscriptions by clerId' })
  @ApiResponse({
    status: 200,
    description: 'Return subscriptions of user.',
    type: [SubscriptionResponse],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'clerkId', description: 'The user clerkId' })
  async getActiveSubscriptionController(
    @Param('clerkId') clerkId: string,
  ): Promise<SubscriptionResponse[] | []> {
    try {
      this.logger.log(`Searching active subscriptions by clerkId: ${clerkId}`);
      const subscription =
        await this.subscriptionAdapter.getSubscriptionHistory(clerkId);
      return subscription;
    } catch (error: any) {
      throw error;
    }
  }
}
