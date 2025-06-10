import { Inject } from '@nestjs/common';

import { SubscriptionAdapterInterface } from 'src/contexts/module_webhook/mercadopago/application/adapter/in/mp-subscription.adapter.interface';
import { SubscriptionServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-subscription.service.interface';
import { FetchToMpInterface } from '../../../application/adapter/out/fech.to.mp.interface';

export class SubscriptionAdapter implements SubscriptionAdapterInterface {
  constructor(
    @Inject('SubscriptionServiceInterface')
    private readonly subscriptionService: SubscriptionServiceInterface,
    @Inject('FetchToMpInterface')
    private readonly fetchToMpAdapter: FetchToMpInterface,
  ) {}
  async deleteSubscription(id: string): Promise<void> {
    try {
      const subscriptions =
        await this.subscriptionService.getActiveSubscriptions(id);
      if (!subscriptions || subscriptions.length === 0) {
        return;
      }
      subscriptions.forEach(async (subscription: any) => {
        await this.fetchToMpAdapter.changeSubscriptionStatusInMercadopago_fetch(
          "https://api.mercadopago.com/preapproval/",
          subscription.mpPreapprovalId,
          'cancelled',
        );
      });
    } catch (error: any) {
      throw error;
    }
  }
  async getSubscriptionHistory(external_reference: string): Promise<any[]> {
    try {
      const subscriptions =
        await this.subscriptionService.getSubscriptionHistory(
          external_reference,
        );
      return subscriptions;
    } catch (error: any) {
      throw error;
    }
  }
}
