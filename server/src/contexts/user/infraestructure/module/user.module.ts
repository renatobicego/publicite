import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserRepository } from '../repository/user.repository';
import { UserService } from '../../application/service/user.service';
import { UserController } from '../controller/user.controller';

@Module({
  // imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers:[UserController],
  providers: [
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepository,
    },
    UserService,
  ],
  exports: [
    UserService,
    'UserRepositoryInterface', // Asegúrate de exportar UserRepositoryInterface
  ],
})
export class UserModule {}
