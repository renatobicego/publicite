import { ClientSession } from 'mongoose';
import { User } from '../entity/user.entity';
import { UserBussiness } from '../entity/userBussiness.entity';
import { UserPerson } from '../entity/userPerson.entity';

export interface UserRepositoryInterface {
  save(
    reqUser: UserPerson | UserBussiness,
    type: number,
    session?: ClientSession,
  ): Promise<User>;
}
