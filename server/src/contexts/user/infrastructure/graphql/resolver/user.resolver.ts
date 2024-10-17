import { Inject, UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/clerk-auth/clerk.auth.guard';
import { User_Full_Grapql_Model } from 'src/contexts/user/domain/entity/models_graphql/user.full.grapql.model';
import { UserAdapterInterface } from 'src/contexts/user/application/adapter/userAdapter.interface';

//´Provee instrucciones para transformar las insttrucciones provenientes del cliente en data que graph puede utilizar
// Los resolvers son similareas a los controladores traicionales de un rest enpoint. SON PROVIDERS para nest

@Resolver()
export class UserResolver {
  constructor(
    @Inject('UserAdapterInterface')
    private readonly userAdapter: UserAdapterInterface,
  ) {}

  @Query(() => User_Full_Grapql_Model, {
    nullable: true,
    description: 'Obtiene un usuario por su nombre de usuario',
  })
  @UseGuards(ClerkAuthGuard)
  async findUserByUsername(
    @Args('username', { type: () => String }) username: string,
  ): Promise<User_Full_Grapql_Model | null> {
    try {
      return await this.userAdapter.findUserByUsername(username);
    } catch (error: any) {
      throw error;
    }
  }
}
