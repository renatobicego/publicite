import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { AvatarServiceInterface } from '../../../domain/service/avatar.service.interface';
import { Avatar } from '../../../domain/entity/avatar.entity';
import { CreateAvatarRequest } from '../../../application/dto/HTTP-REQUEST/create.avatar.request';
import { UpdateAvatarRequest } from '../../../application/dto/HTTP-REQUEST/update.avatar.request';
import { AvatarResponse } from '../../../application/dto/HTTP-RESPONSE/avatar.response';

/**
 * CRUD de avatares. Todo exige usuario autenticado: un avatar es siempre de
 * alguien y sólo su dueño puede verlo o editarlo.
 */
@Resolver()
@UseGuards(ClerkAuthGuard)
export class AvatarResolver {
  constructor(
    @Inject('AvatarServiceInterface')
    private readonly avatarService: AvatarServiceInterface,
  ) {}

  @Query(() => [AvatarResponse], {
    description: 'Avatares del usuario logueado',
  })
  async getUserAvatars(
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<AvatarResponse[]> {
    const avatars = await this.avatarService.getUserAvatars(
      context.req.userRequestId,
    );
    return avatars.map((avatar) => this.toResponse(avatar));
  }

  @Mutation(() => AvatarResponse, { description: 'Crea un avatar' })
  async createAvatar(
    @Args('input', { type: () => CreateAvatarRequest })
    input: CreateAvatarRequest,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<AvatarResponse> {
    const avatar = await this.avatarService.createAvatar(
      context.req.userRequestId,
      input,
    );
    return this.toResponse(avatar);
  }

  @Mutation(() => AvatarResponse, { description: 'Edita un avatar propio' })
  async updateAvatar(
    @Args('input', { type: () => UpdateAvatarRequest })
    input: UpdateAvatarRequest,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<AvatarResponse> {
    const avatar = await this.avatarService.updateAvatar(
      context.req.userRequestId,
      input,
    );
    return this.toResponse(avatar);
  }

  @Mutation(() => Boolean, { description: 'Elimina un avatar propio' })
  async deleteAvatar(
    @Args('avatarId', { type: () => ID }) avatarId: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<boolean> {
    return await this.avatarService.deleteAvatar(
      context.req.userRequestId,
      avatarId,
    );
  }

  private toResponse(avatar: Avatar): AvatarResponse {
    return {
      _id: avatar.getId?.toString() ?? '',
      userId: avatar.getUserId,
      name: avatar.getName,
      context: avatar.getContext,
      seed: avatar.getSeed,
      createdAt: avatar.getCreatedAt,
      updatedAt: avatar.getUpdatedAt,
    };
  }
}
