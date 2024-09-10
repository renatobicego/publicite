import { Inject } from '@nestjs/common';

import { SubscriptionRepositoryInterface } from 'src/contexts/webhook/domain/mercadopago/repository/mp-subscription.respository.interface';
import { SubscriptionServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-subscription.service.interface';
import Subscription from 'src/contexts/webhook/domain/mercadopago/entity/subcription.entity';

export class MpSubscriptionService implements SubscriptionServiceInterface {
  constructor(
    @Inject('SubscriptionRepositoryInterface')
    private readonly subscriptionRepository: SubscriptionRepositoryInterface,
  ) {}
  async getSubscriptionHistory(
    external_reference: string,
  ): Promise<Subscription[]> {
    try {
      const subscriptions =
        this.subscriptionRepository.getSubscriptionHistory(external_reference);
      return subscriptions;
    } catch (error: any) {
      throw error;
    }
  }
}
