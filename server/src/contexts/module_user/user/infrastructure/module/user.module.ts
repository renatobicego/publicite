import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserController } from '../controller/user.controller';

import { UserService } from '../../application/service/user.service';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserRepository } from '../repository/user.repository';
import { UserPersonModel } from '../schemas/userPerson.schema';
import { UserBusinessModel } from '../schemas/userBussiness.schema';
import { UserModel } from '../schemas/user.schema';
import { ContactModule } from 'src/contexts/module_user/contact/infrastructure/module/contact.module';
import { SectorRepository } from 'src/contexts/module_user/businessSector/infrastructure/repository/sector.repository';
import { SectorModule } from 'src/contexts/module_user/businessSector/infrastructure/module/sector.module';
import { UserAdapter } from '../adapters/user.adapter';
import { UserResolver } from '../graphql/resolver/user.resolver';
import { UserRelationModel } from '../schemas/user.relation.schema';
import { MagazineModelSharedModule } from 'src/contexts/module_shared/sharedSchemas/magazine.model.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserModel.modelName,
        schema: UserModel.schema,
        discriminators: [
          { name: UserPersonModel.modelName, schema: UserPersonModel.schema },
          {
            name: UserBusinessModel.modelName,
            schema: UserBusinessModel.schema,
          },
        ],
      },
      {
        name: UserRelationModel.modelName,
        schema: UserRelationModel.schema,
      },
    ]),
    ContactModule,
    SectorModule,
    MagazineModelSharedModule,
  ],
  controllers: [UserController],
  providers: [
    MyLoggerService,
    UserResolver,
    {
      provide: 'UserAdapterInterface',
      useClass: UserAdapter,
    },
    {
      provide: 'UserServiceInterface',
      useClass: UserService,
    },
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepository,
    },
    {
      provide: 'SectorRepositoryInterface',
      useClass: SectorRepository,
    },
    UserService,
  ],
  exports: ['UserServiceInterface', 'UserRepositoryInterface'],
})
export class UserModule { }
