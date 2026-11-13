import { UseGuards } from '@nestjs/common';
import { Args, Context, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { ClerkAuthGuardOptional } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard.optional';
import { AdminGuard } from 'src/contexts/module_shared/auth/clerk-auth/admin.guard';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { optionalUserId, requireUserId } from '../../../shared/require-user';
import { PlanGiftAdapter } from '../adapter/plan-gift.adapter';
import { BuyPlanGiftInput } from '../../application/dto/buy-plan-gift.input';
import {
  AdminPlanGiftsResponse,
  BuyPlanGiftResponse,
  MyPlanGiftsResponse,
  PlanGiftModel,
  PlanGiftPublicModel,
  PlanGiftQuote,
} from '../../domain/graphql_models/plan-gift.model.graphql';

type Ctx = { req: CustomContextRequestInterface };

@Resolver()
export class PlanGiftResolver {
  constructor(private readonly adapter: PlanGiftAdapter) {}

  @Query(() => PlanGiftQuote, { description: 'Cuánto sale regalar N meses de un plan' })
  @UseGuards(ClerkAuthGuard)
  async planGiftQuote(
    @Args('mpPreapprovalPlanId', { type: () => String }) mpPreapprovalPlanId: string,
    @Args('months', { type: () => Int }) months: number,
    @Context() context: Ctx,
  ): Promise<PlanGiftQuote> {
    requireUserId(context);
    return this.adapter.getQuote(mpPreapprovalPlanId, months);
  }

  @Mutation(() => BuyPlanGiftResponse, { description: 'Regala N meses de un plan (pago único)' })
  @UseGuards(ClerkAuthGuard)
  async buyPlanGift(
    @Args('input', { type: () => BuyPlanGiftInput }) input: BuyPlanGiftInput,
    @Context() context: Ctx,
  ): Promise<BuyPlanGiftResponse> {
    return this.adapter.buy(requireUserId(context), input);
  }

  @Query(() => PlanGiftPublicModel, { description: 'Datos mínimos del link /canjear/<código>' })
  @UseGuards(ClerkAuthGuardOptional)
  async planGiftByCode(
    @Args('code', { type: () => String }) code: string,
    @Context() context: Ctx,
  ): Promise<PlanGiftPublicModel> {
    return this.adapter.getByCode(code, optionalUserId(context));
  }

  @Mutation(() => PlanGiftModel, { description: 'Toma un regalo reservado al email de la cuenta' })
  @UseGuards(ClerkAuthGuard)
  async claimPlanGift(
    @Args('code', { type: () => String }) code: string,
    @Context() context: Ctx,
  ): Promise<PlanGiftModel> {
    return this.adapter.claim(requireUserId(context), code);
  }

  @Mutation(() => PlanGiftModel, { description: 'Activa un regalo recibido: desde ahí cuentan los meses' })
  @UseGuards(ClerkAuthGuard)
  async activatePlanGift(
    @Args('giftId', { type: () => ID }) giftId: string,
    @Context() context: Ctx,
  ): Promise<PlanGiftModel> {
    return this.adapter.activate(requireUserId(context), giftId);
  }

  @Mutation(() => PlanGiftModel, { description: 'Quien regala corrige el email del destinatario' })
  @UseGuards(ClerkAuthGuard)
  async updatePlanGiftEmail(
    @Args('giftId', { type: () => ID }) giftId: string,
    @Args('email', { type: () => String }) email: string,
    @Context() context: Ctx,
  ): Promise<PlanGiftModel> {
    return this.adapter.updateEmail(requireUserId(context), giftId, email);
  }

  @Query(() => MyPlanGiftsResponse, { description: 'Regalos que hice y que recibí' })
  @UseGuards(ClerkAuthGuard)
  async myPlanGifts(@Context() context: Ctx): Promise<MyPlanGiftsResponse> {
    return this.adapter.getMine(requireUserId(context));
  }

  @Query(() => AdminPlanGiftsResponse, { description: 'Sólo admin: registro de todos los regalos' })
  @UseGuards(ClerkAuthGuard, AdminGuard)
  async planGiftsAdmin(
    @Args('page', { type: () => Int }) page: number,
    @Args('limit', { type: () => Int }) limit: number,
  ): Promise<AdminPlanGiftsResponse> {
    return this.adapter.getAllAdmin(page, limit);
  }
}
