// user.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { UserRepositoryInterface } from '../domain/user-repository.interface';
import { User } from '../domain/entity/user.entity';






@Injectable()
export class UserService {

  constructor(
    @Inject('UserRepositoryInterface') private readonly userRepository: UserRepositoryInterface
  ) {}

	async createUser(user: User): Promise<User> {
    return this.userRepository.createUser(user);
  }


}
