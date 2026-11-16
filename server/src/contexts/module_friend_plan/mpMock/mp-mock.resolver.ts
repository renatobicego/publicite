import { UseGuards } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { isMpMockEnabled } from 'src/contexts/module_shared/mp-mock/mp-mock.config';
import { requireUserId } from '../shared/require-user';
import { MpMockFriendGroupEvent, MpMockService } from './mp-mock.service';

type Ctx = { req: CustomContextRequestInterface };

/*
Simulador de avisos de MercadoPago para desarrollo local (MP_MOCK). Fuera de ese
modo todas las mutations responden Forbidden.
*/
@Resolver()
export class MpMockResolver {
  constructor(private readonly service: MpMockService) {}

  @Query(() => Boolean, { description: 'True si el server corre con MercadoPago simulado' })
  mpMockEnabled(): boolean {
    return isMpMockEnabled();
  }

  @Mutation(() => Boolean, {
    description:
      'Sólo local: simula un aviso de MP del grupo (charge_failed, charge_recovered, payment_failed_expired, cancelled_in_mp)',
  })
  @UseGuards(ClerkAuthGuard)
  async mpMockFriendGroupEvent(
    @Args('groupId', { type: () => ID }) groupId: string,
    @Args('event', { type: () => String }) event: MpMockFriendGroupEvent,
    @Context() context: Ctx,
  ): Promise<boolean> {
    return this.service.friendGroupEvent(requireUserId(context), groupId, event);
  }

  @Mutation(() => Boolean, { description: 'Sólo local: simula la devolución del pago de un regalo' })
  @UseGuards(ClerkAuthGuard)
  async mpMockRefundGift(
    @Args('giftId', { type: () => ID }) giftId: string,
    @Context() context: Ctx,
  ): Promise<boolean> {
    return this.service.refundGift(requireUserId(context), giftId);
  }
}
