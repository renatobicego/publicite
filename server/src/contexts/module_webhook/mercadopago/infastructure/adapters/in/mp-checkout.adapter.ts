import { Inject } from '@nestjs/common';

import { MpCheckoutAdapterInterface } from '../../../application/adapter/in/mp-checkout.adapter.interface';
import { StartSubscriptionCheckoutInput } from '../../../application/dto/start-subscription-checkout.input';
import { SubscriptionCheckoutResponse } from '../../../domain/graphql_models/response/subscription-checkout.model.graphql';
import { MpCheckoutServiceInterface } from '../../../domain/service/mp-checkout.service.interface';

export class MpCheckoutAdapter implements MpCheckoutAdapterInterface {
  constructor(
    @Inject('MpCheckoutServiceInterface')
    private readonly checkoutService: MpCheckoutServiceInterface,
  ) {}

  async startSubscriptionCheckout(
    userId: string,
    input: StartSubscriptionCheckoutInput,
  ): Promise<SubscriptionCheckoutResponse> {
    return this.checkoutService.startSubscriptionCheckout(userId, {
      mpPreapprovalPlanId: input.mpPreapprovalPlanId,
      cardTokenId: input.cardTokenId,
      payerEmail: input.payerEmail,
      replacesSubscriptionId: input.replacesSubscriptionId ?? null,
    });
  }

  async cancelMySubscription(userId: string, mpPreapprovalId: string): Promise<boolean> {
    return this.checkoutService.cancelMySubscription(userId, mpPreapprovalId);
  }

  async updateMySubscriptionCard(
    userId: string,
    mpPreapprovalId: string,
    cardTokenId: string,
  ): Promise<boolean> {
    return this.checkoutService.updateMySubscriptionCard(userId, mpPreapprovalId, cardTokenId);
  }
}
