import { ClientSession } from 'mongoose';
import { User } from '../entity/user.entity';
import { UserBussiness } from '../entity/userBussiness.entity';
import { UP_update, UserPerson } from '../entity/userPerson.entity';

export interface UserRepositoryInterface {
  save(
    reqUser: UserPerson | UserBussiness,
    type: number,
    session?: ClientSession,
  ): Promise<User>;

  update(username: string, reqUser: UP_update, type: number): Promise<User>;
}
