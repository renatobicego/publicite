import { UseGuards } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { ClerkAuthGuardOptional } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard.optional';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { optionalUserId, requireUserId } from '../../../shared/require-user';
import { FriendGroupAdapter } from '../adapter/friend-group.adapter';
import { PayFriendGroupInput } from '../../application/dto/pay-friend-group.input';
import {
  FriendGroupModel,
  FriendGroupPricingModel,
  FriendGroupPublicModel,
  FriendPlanOptionsResponse,
  MyFriendGroupResponse,
  PayFriendGroupResponse,
} from '../../domain/graphql_models/friend-group.model.graphql';

type Ctx = { req: CustomContextRequestInterface };

/*
Hacete Amigo. El usuario sale siempre del token y los permisos se validan
contra el grupo guardado (miembro aceptado, quien lo armó, quien paga).
*/
@Resolver()
export class FriendGroupResolver {
  constructor(private readonly adapter: FriendGroupAdapter) {}

  @Query(() => FriendPlanOptionsResponse, {
    description: 'Planes de Hacete Amigo con el precio según la cantidad de miembros',
  })
  @UseGuards(ClerkAuthGuardOptional)
  async friendPlanOptions(): Promise<FriendPlanOptionsResponse> {
    return this.adapter.getOptions();
  }

  @Query(() => MyFriendGroupResponse, { description: 'Mi grupo y mis invitaciones' })
  @UseGuards(ClerkAuthGuard)
  async myFriendGroup(@Context() context: Ctx): Promise<MyFriendGroupResponse> {
    return this.adapter.getMine(requireUserId(context));
  }

  @Query(() => FriendGroupPublicModel, { description: 'Datos mínimos del link de invitación' })
  @UseGuards(ClerkAuthGuardOptional)
  async friendGroupByInviteCode(
    @Args('code', { type: () => String }) code: string,
    @Context() context: Ctx,
  ): Promise<FriendGroupPublicModel> {
    return this.adapter.getByInviteCode(code, optionalUserId(context));
  }

  @Query(() => FriendGroupPricingModel, { description: 'Valida el grupo y devuelve el monto a debitar' })
  @UseGuards(ClerkAuthGuard)
  async friendGroupCheckout(
    @Args('groupId', { type: () => ID }) groupId: string,
    @Context() context: Ctx,
  ): Promise<FriendGroupPricingModel> {
    return this.adapter.getCheckout(requireUserId(context), groupId);
  }

  @Mutation(() => FriendGroupModel, { description: 'Arma un grupo con un plan pago mensual' })
  @UseGuards(ClerkAuthGuard)
  async createFriendGroup(
    @Args('mpPreapprovalPlanId', { type: () => String }) mpPreapprovalPlanId: string,
    @Context() context: Ctx,
  ): Promise<FriendGroupModel> {
    return this.adapter.create(requireUserId(context), mpPreapprovalPlanId);
  }

  @Mutation(() => FriendGroupModel)
  @UseGuards(ClerkAuthGuard)
  async inviteToFriendGroup(
    @Args('groupId', { type: () => ID }) groupId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @Context() context: Ctx,
  ): Promise<FriendGroupModel> {
    return this.adapter.invite(requireUserId(context), groupId, userId);
  }

  @Mutation(() => MyFriendGroupResponse)
  @UseGuards(ClerkAuthGuard)
  async respondFriendGroupInvitation(
    @Args('groupId', { type: () => ID }) groupId: string,
    @Args('accept', { type: () => Boolean }) accept: boolean,
    @Context() context: Ctx,
  ): Promise<MyFriendGroupResponse> {
    return this.adapter.respondInvitation(requireUserId(context), groupId, accept);
  }

  @Mutation(() => FriendGroupModel, { description: 'Entrar por el link equivale a aceptar' })
  @UseGuards(ClerkAuthGuard)
  async joinFriendGroupByInviteCode(
    @Args('code', { type: () => String }) code: string,
    @Context() context: Ctx,
  ): Promise<FriendGroupModel> {
    return this.adapter.joinByInviteCode(requireUserId(context), code);
  }

  @Mutation(() => FriendGroupModel, { description: 'Sólo quien armó el grupo; el link anterior deja de servir' })
  @UseGuards(ClerkAuthGuard)
  async regenerateFriendGroupInviteCode(
    @Args('groupId', { type: () => ID }) groupId: string,
    @Context() context: Ctx,
  ): Promise<FriendGroupModel> {
    return this.adapter.regenerateInviteCode(requireUserId(context), groupId);
  }

  @Mutation(() => FriendGroupModel, { description: 'Sólo quien armó el grupo y mientras se arma' })
  @UseGuards(ClerkAuthGuard)
  async removeFriendGroupMember(
    @Args('groupId', { type: () => ID }) groupId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @Context() context: Ctx,
  ): Promise<FriendGroupModel> {
    return this.adapter.removeMember(requireUserId(context), groupId, userId);
  }

  @Mutation(() => Boolean, { description: 'Pagado, se cancela el plan para todos' })
  @UseGuards(ClerkAuthGuard)
  async leaveFriendGroup(
    @Args('groupId', { type: () => ID }) groupId: string,
    @Context() context: Ctx,
  ): Promise<boolean> {
    return this.adapter.leave(requireUserId(context), groupId);
  }

  @Mutation(() => PayFriendGroupResponse, { description: 'Uno paga por todos: débito automático mensual' })
  @UseGuards(ClerkAuthGuard)
  async payFriendGroup(
    @Args('input', { type: () => PayFriendGroupInput }) input: PayFriendGroupInput,
    @Context() context: Ctx,
  ): Promise<PayFriendGroupResponse> {
    return this.adapter.pay(requireUserId(context), input);
  }
}
