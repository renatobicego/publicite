import { InjectModel } from '@nestjs/mongoose';
import { Inject } from '@nestjs/common';
import { Args, Info, Query, Resolver } from '@nestjs/graphql';
import { Model } from 'mongoose';

import { IUser, UserModel } from '../../schemas/user.schema';
import { User_Full_Grapql_Model } from 'src/contexts/user/domain/entity/models_graphql/user.full.grapql.model';
import { UserAdapterInterface } from 'src/contexts/user/application/adapter/userAdapter.interface';

//´Provee instrucciones para transformar las insttrucciones provenientes del cliente en data que graph puede utilizar
// Los resolvers son similareas a los controladores traicionales de un rest enpoint. SON PROVIDERS para nest

@Resolver()
export class UserResolver {
  //Definimos las query
  constructor(
    @InjectModel(UserModel.modelName)
    private readonly user: Model<IUser>,

    @Inject('UserAdapterInterface')
    private readonly userAdapter: UserAdapterInterface,
  ) {}

  @Query(() => String)
  hello() {
    console.log('hello');
    return 'hello';
  }

  @Query(() => User_Full_Grapql_Model, {
    nullable: true,
    description: 'Obtiene un usuario por su nombre de usuario',
  })
  async findOneByUsername(
    @Args('username', { type: () => String }) username: string,
    @Info() info: any,
  ): Promise<User_Full_Grapql_Model | null> {
    try {
      const keys = info.fieldNodes[0].selectionSet.selections.map(
        (item: any) => item.name.value,
      );

      return await this.userAdapter.findUserByUsername(username, keys);
    } catch (error: any) {
      throw error;
    }
  }
}
