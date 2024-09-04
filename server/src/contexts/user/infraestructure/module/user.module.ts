import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserController } from '../controller/user.controller';
import { UserAdapter } from '../adapters/user.adapter';
import { UserService } from '../../application/service/user.service';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { UserRepository } from '../repository/user.repository';
import { UserPersonModel } from '../schemas/userPerson.schema';
import { UserBusinessModel } from '../schemas/userBussiness.schema';
import { UserModel } from '../schemas/user.schema';
import { ContactModule } from 'src/contexts/contact/infraestructure/module/contact.module';
import { SectorRepository } from 'src/contexts/businessSector/infraestructure/repository/sector.repository';
import { SectorModule } from 'src/contexts/businessSector/infraestructure/module/sector.module';

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
  exports: ['UserServiceInterface'],
})
export class UserModule {}
