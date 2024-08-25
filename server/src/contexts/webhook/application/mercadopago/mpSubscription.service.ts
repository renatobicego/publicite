import { Inject, InternalServerErrorException } from '@nestjs/common';
import { SubscriptionServiceInterface } from '../../domain/mercadopago/service/subscription.service.interface';
import { SubscriptionResponse } from '../../infraestructure/controllers/response/subscription.response';
import { SubscriptionRepositoryInterface } from '../../domain/mercadopago/repository/subscription.respository.interface';

export class MpSubscriptionService implements SubscriptionServiceInterface {
  constructor(
    @Inject('SubscriptionRepositoryInterface')
    private readonly subscriptionRepository: SubscriptionRepositoryInterface,
  ) {}
  getSubscriptionByEmail(
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
