import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  UseGuards,
} from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { SubscriptionAdapterInterface } from '../../application/adapter/in/mp-subscription.adapter.interface';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { AuthSocket } from 'src/contexts/module_socket/infrastructure/auth/socket.auth';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('SubscriptionAdapterInterface')
    private readonly subscriptionAdapter: SubscriptionAdapterInterface,
  ) {}

  @Get(':_id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClerkAuthGuard)
  async getActiveSubscriptionController(
    @Param('_id') _id: string,
  ): Promise<any[] | []> {
    try {
      this.logger.log(`Searching active subscriptions by clerkId: ${_id}`);
      const subscription =
        await this.subscriptionAdapter.getSubscriptionHistory(_id);
      return subscription;
    } catch (error: any) {
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(AuthSocket)
  async deleteSubscriptionController(@Param('id') id: string) {
    try {
      await this.subscriptionAdapter.deleteSubscription(id);
    } catch (error: any) {
      throw error;
    }
  }
}
