// user.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { UserRepositoryInterface } from '../domain/user-service.interface';
import { User } from '../domain/entity/user.entity';
import { CreateUserDto } from './Dtos/create-user.dto';





@Injectable()
export class UserService {

  constructor(
    @Inject('UserRepositoryInterface') private readonly userRepository: UserRepositoryInterface
  ) {}

	async createUser(data: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(data);
  }


}
