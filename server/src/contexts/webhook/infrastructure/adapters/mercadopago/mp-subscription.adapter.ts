import { Inject } from '@nestjs/common';

import { SubscriptionResponse } from '../../../application/mercadopago/adapter/HTTP-RESPONSE/subscription.response';
import { SubscriptionAdapterInterface } from 'src/contexts/webhook/application/mercadopago/adapter/mp-subscription.adapter.interface';
import { SubscriptionServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-subscription.service.interface';
import Subscription from 'src/contexts/webhook/domain/mercadopago/entity/subcription.entity';

export class SubscriptionAdapter implements SubscriptionAdapterInterface {
  constructor(
    @Inject('SubscriptionServiceInterface')
    private readonly subscriptionService: SubscriptionServiceInterface,
  ) {}
  async getSubscriptionHistory(
    external_reference: string,
  ): Promise<SubscriptionResponse[]> {
    try {
      const subscriptions =
        await this.subscriptionService.getSubscriptionHistory(
          external_reference,
        );
      return subscriptions.map((subscription) => {
        return Subscription.formatEntityToResponse(subscription);
      });
    } catch (error: any) {
      throw error;
    }
  }
}
