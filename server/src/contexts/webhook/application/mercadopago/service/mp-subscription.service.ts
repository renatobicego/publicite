import { Inject, InternalServerErrorException } from '@nestjs/common';

import { SubscriptionRepositoryInterface } from 'src/contexts/webhook/domain/mercadopago/repository/mp-subscription.respository.interface';
import { SubscriptionServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-subscription.service.interface';
import { SubscriptionResponse } from 'src/contexts/webhook/infraestructure/controllers/response/subscription.response';

export class MpSubscriptionService implements SubscriptionServiceInterface {
  constructor(
    @Inject('SubscriptionRepositoryInterface')
    private readonly subscriptionRepository: SubscriptionRepositoryInterface,
  ) {}
  async getActiveSubscriptionByEmail(
    email: string,
  ): Promise<SubscriptionResponse | null> {
    try {
      const subscription =
        this.subscriptionRepository.getActiveSubscriptionByEmail(email);

      return subscription || null;
    } catch (error: any) {
      throw new InternalServerErrorException(error);
    }
  }
  getSubscriptionsByEmail(
    subID: string,
    email: string,
  ): Promise<SubscriptionResponse[]> {
    try {
      const subscriptions = this.subscriptionRepository.getSubscriptionByEmail(
        subID,
        email,
      );
      return subscriptions;
    } catch (error: any) {
      throw new InternalServerErrorException(error);
    }
  }
}
