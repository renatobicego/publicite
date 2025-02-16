import { Inject } from '@nestjs/common';

import { SubscriptionAdapterInterface } from 'src/contexts/module_webhook/mercadopago/application/adapter/in/mp-subscription.adapter.interface';
import { SubscriptionServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-subscription.service.interface';

export class SubscriptionAdapter implements SubscriptionAdapterInterface {
  constructor(
    @Inject('SubscriptionServiceInterface')
    private readonly subscriptionService: SubscriptionServiceInterface,
  ) { }
  async getSubscriptionHistory(
    external_reference: string,
  ): Promise<any[]> {
    try {
      const subscriptions =
        await this.subscriptionService.getSubscriptionHistory(
          external_reference,
        );
      return subscriptions
    } catch (error: any) {
      throw error;
    }
  }
}
