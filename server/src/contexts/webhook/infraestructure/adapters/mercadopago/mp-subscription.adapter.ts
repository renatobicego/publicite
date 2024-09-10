import { Inject } from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';

import { SubscriptionResponse } from '../../../application/mercadopago/adapter/HTTP-RESPONSE/subscription.response';
import { SubscriptionAdapterInterface } from 'src/contexts/webhook/application/mercadopago/adapter/mp-subscription.adapter.interface';
import { SubscriptionServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-subscription.service.interface';

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
