import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../schemas/user.schema';
import { UserRepository } from '../repository/user.repository';
import { UserService } from '../../application/user.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
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
