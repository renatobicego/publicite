import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';


import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';

import { UserAdapterInterface } from '../../../application/adapter/userAdapter.interface';
import { User_Full_Grapql_Model } from '../../../domain/entity/models_graphql/user.full.grapql.model';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { PubliciteAuth } from 'src/contexts/module_shared/auth/publicite_auth/publicite_auth';




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
    @Args('username', { type: () => String }) username: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<User_Full_Grapql_Model | null> {
    try {
      const userRequestId = context.req.userRequestId;
      return await this.userAdapter.findUserByUsername(username, userRequestId);
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Obtiene un usuario por su nombre de usuario ',
  })
  @UseGuards(ClerkAuthGuard)
  async removeFriend(
    @Args('relationId', { type: () => String }) relationId: string,
  ): Promise<any> {
    await this.userAdapter.removeFriend(relationId);
    return 'Relation successfully deleted';
  }




}


