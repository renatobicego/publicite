import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
} from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';

import { SubscriptionAdapterInterface } from '../../domain/mercadopago/adapter/subscription.adapter.interface';
import { SubscriptionResponse } from './response/subscription.response';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

// const subscriptionMock: SubscriptionResponse = {
//   mpPreapprovalId: 'mpPreapprovalId',
//   payerId: 'payerId',
//   status: 'status',
//   subscriptionPlan: '66c49508e80296e90ec637d8' as unknown as ObjectId,
//   startDate: 'startDate',
//   endDate: 'endDate',
//   external_reference: 'external_reference',
// };
@ApiTags('Subscriptions')
@Controller('mercadopago/subscription')
export class SubscriptionController {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('SubscriptionAdapterInterface')
    private readonly subscriptionAdapter: SubscriptionAdapterInterface,
  ) {}
  /*
  CONSULTAR SI DEVUELVO ARRAY VACIO O 404
  */
  @Get(':subscriptionId/:userId')
  @ApiOperation({ summary: 'Get all subscription by userId' })
  @ApiResponse({
    status: 200,
    description: 'Return all subscriptions of user.',
    type: [SubscriptionResponse],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiResponse({
    status: 404,
    description: 'There are no subscriptions with that subscription ID.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'subscriptionId', description: 'The subscription ID' })
  @ApiParam({ name: 'userId', description: 'The user ID' })
  async handleWebhookClerk(
    @Param('subscriptionId') subscriptionId: string,
    @Param('userId') userId: string,
  ): Promise<SubscriptionResponse[]> {
    try {
      this.logger.log(
        `Searching subscriptions by subscriptionId: ${subscriptionId}, UserId: ${userId}`,
      );
      const subscription =
        await this.subscriptionAdapter.getSubscriptionByEmail(
          subscriptionId,
          userId,
        );
      return subscription;
    } catch (error: any) {
      throw error;
    }
  }
}