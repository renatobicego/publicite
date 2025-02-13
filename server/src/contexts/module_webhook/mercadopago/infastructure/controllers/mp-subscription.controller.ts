import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  UseGuards,
} from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { SubscriptionAdapterInterface } from '../../application/adapter/in/mp-subscription.adapter.interface';
import { SubscriptionResponse } from '../../application/adapter/HTTP-RESPONSE/subscription.response';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';

@ApiTags('My Subscriptions')
@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('SubscriptionAdapterInterface')
    private readonly subscriptionAdapter: SubscriptionAdapterInterface,
  ) { }

  @Get(':_id')
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
  @ApiParam({ name: '_id', description: 'The user mongo id' })
  //@UseGuards(ClerkAuthGuard)
  async getActiveSubscriptionController(
    @Param('_id') _id: string,
  ): Promise<SubscriptionResponse[] | []> {
    try {
      this.logger.log(`Searching active subscriptions by clerkId: ${_id}`);
      const subscription =
        await this.subscriptionAdapter.getSubscriptionHistory(_id);
      return subscription;
    } catch (error: any) {
      throw error;
    }
  }




}
