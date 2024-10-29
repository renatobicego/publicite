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
import { UserMapper } from '../adapters/mapper-implementations/user.mapper';
import { UserRepositoryMapper } from '../repository/mappers/user.repository.mapper';
import { UserAdapter } from '../adapters/user.adapter';
import { UserResolver } from '../graphql/resolver/user.resolver';

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
    ]),
    ContactModule,
    SectorModule,
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
    {
      provide: 'UserMapperInterface',
      useClass: UserMapper,
    },
    {
      provide: 'UserRepositoryMapperInterface',
      useClass: UserRepositoryMapper,
    },
    UserService,
  ],
  exports: ['UserServiceInterface', 'UserRepositoryInterface'],
})
export class UserModule {}
