import { SubscriptionAdapterInterface } from 'src/contexts/webhook/domain/mercadopago/adapter/subscription.adapter.interface';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { SubscriptionServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/subscription.service.interface';
import { Inject } from '@nestjs/common';
import { SubscriptionResponse } from '../../controllers/response/subscription.response';

export class SubscriptionAdapter implements SubscriptionAdapterInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('SubscriptionServiceInterface')
    private readonly subscriptionService: SubscriptionServiceInterface,
  ) {}
  async getSubscriptionsByEmail(
    subID: string,
    email: string,
  ): Promise<SubscriptionResponse[]> {
    const subscription = await this.subscriptionService.getSubscriptionsByEmail(
      subID,
      email,
    );
    return Promise.resolve(subscription);
  }

  async getActiveSubscriptionByEmail(
    email: string,
  ): Promise<SubscriptionResponse | null> {
    const subscription =
      await this.subscriptionService.getActiveSubscriptionByEmail(email);
    return Promise.resolve(subscription);
  }
}
