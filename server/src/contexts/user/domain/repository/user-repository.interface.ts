import { User } from '../entity/user.entity';
import { UserBussiness } from '../entity/userBussiness.entity';
import { UserPerson } from '../entity/userPerson.entity';

export interface UserRepositoryInterface {
  save(user: UserPerson | UserBussiness, type: number): Promise<User>;
}
