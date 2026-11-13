import { StartSubscriptionCheckoutInput } from '../../dto/start-subscription-checkout.input';
import { SubscriptionCheckoutResponse } from '../../../domain/graphql_models/response/subscription-checkout.model.graphql';

export interface MpCheckoutAdapterInterface {
  startSubscriptionCheckout(
    userId: string,
    input: StartSubscriptionCheckoutInput,
  ): Promise<SubscriptionCheckoutResponse>;
  cancelMySubscription(userId: string, mpPreapprovalId: string): Promise<boolean>;
  updateMySubscriptionCard(
    userId: string,
    mpPreapprovalId: string,
    cardTokenId: string,
  ): Promise<boolean>;
}
