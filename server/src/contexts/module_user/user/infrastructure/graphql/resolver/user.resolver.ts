import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';

import { UserAdapterInterface } from '../../../application/adapter/userAdapter.interface';
import { User_Full_Grapql_Model } from '../../../domain/entity/models_graphql/user.full.grapql.model';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { user_active_relation } from '../../../domain/entity/models_graphql/user.activeRelation.graphql';

@Resolver()
export class UserResolver {
  constructor(
    @Inject('UserAdapterInterface')
    private readonly userAdapter: UserAdapterInterface,
  ) { }

  @Query(() => User_Full_Grapql_Model, {
    nullable: true,
    description: 'Obtiene un usuario por su nombre de usuario ',
  })
  @UseGuards(ClerkAuthGuard)
  async findUserByUsername(
    @Args('_id', { type: () => String }) _id: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<User_Full_Grapql_Model | null> {
    try {
      const userRequestId = context.req.userRequestId;
      return await this.userAdapter.findUserByUsername(_id, userRequestId);
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Remover una relacion de amistad entre dos usuarios',
  })
  @UseGuards(ClerkAuthGuard)
  async removeFriend(
    @Args('relationId', { type: () => String }) relationId: string,
    @Args('friendRequestId', { type: () => String, nullable: true })
    friendRequestId: string,
  ): Promise<any> {
    await this.userAdapter.removeFriend(relationId, friendRequestId);
    return 'Relation successfully deleted';
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Actualiza las relaciones activas del usuario',
  })
  @UseGuards(ClerkAuthGuard)
  async setNewActiveUserRelations(
    @Args('activeRelations', { type: () => [String] }) activeRelations: string[],
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<String> {
    try {
      const userRequestId = context.req.userRequestId;
      await this.userAdapter.setNewActiveUserRelations(activeRelations, userRequestId);
      return 'Active relation  successfully updated';
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => [user_active_relation], {
    nullable: true,
    description: 'Obtiene las relaciones activas del usuario',
  })
  @UseGuards(ClerkAuthGuard)
  async getActiveRelationsOfUser(
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<user_active_relation[] | null> {
    try {
      const userRequestId = context.req.userRequestId;
      const activeRelations = await this.userAdapter.getActiveRelationsOfUser(userRequestId) ?? []
      return activeRelations
    } catch (error: any) {
      throw error;
    }
  }


}
