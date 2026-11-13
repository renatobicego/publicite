import { ForbiddenException, Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { MpCheckoutAdapterInterface } from '../../application/adapter/in/mp-checkout.adapter.interface';
import { StartSubscriptionCheckoutInput } from '../../application/dto/start-subscription-checkout.input';
import { SubscriptionCheckoutResponse } from '../../domain/graphql_models/response/subscription-checkout.model.graphql';

/*
Altas, bajas y cambio de tarjeta de suscripciones. El usuario sale siempre del
token: ninguna mutation recibe un id de usuario.

ClerkAuthGuard deja pasar el token de "usuario no registrado" sin userRequestId;
acá eso se rechaza (sin un usuario no hay a quién asignarle la suscripción).
*/
function requireUserId(context: { req: CustomContextRequestInterface }): string {
  const userId = context?.req?.userRequestId;
  if (!userId) throw new ForbiddenException('Unauthorized');
  return userId;
}

@Resolver('subscription')
export class MpSubscriptionResolver {
  constructor(
    @Inject('MpCheckoutAdapterInterface')
    private readonly checkoutAdapter: MpCheckoutAdapterInterface,
  ) {}

  @Mutation(() => SubscriptionCheckoutResponse, {
    description:
      'Contrata un plan o un pack con la tarjeta del Brick. Con replacesSubscriptionId es un cambio de plan.',
  })
  @UseGuards(ClerkAuthGuard)
  async startSubscriptionCheckout(
    @Args('input', { type: () => StartSubscriptionCheckoutInput })
    input: StartSubscriptionCheckoutInput,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<SubscriptionCheckoutResponse> {
    return this.checkoutAdapter.startSubscriptionCheckout(requireUserId(context), input);
  }

  @Mutation(() => Boolean, { description: 'Cancela una suscripción propia (plan o pack).' })
  @UseGuards(ClerkAuthGuard)
  async cancelMySubscription(
    @Args('mpPreapprovalId', { type: () => String }) mpPreapprovalId: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<boolean> {
    return this.checkoutAdapter.cancelMySubscription(requireUserId(context), mpPreapprovalId);
  }

  @Mutation(() => Boolean, { description: 'Cambia la tarjeta de una suscripción propia.' })
  @UseGuards(ClerkAuthGuard)
  async updateMySubscriptionCard(
    @Args('mpPreapprovalId', { type: () => String }) mpPreapprovalId: string,
    @Args('cardTokenId', { type: () => String }) cardTokenId: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<boolean> {
    return this.checkoutAdapter.updateMySubscriptionCard(
      requireUserId(context),
      mpPreapprovalId,
      cardTokenId,
    );
  }
}
