import { User } from './entity/user.entity';

export interface UserRepositoryInterface {
  createUser(user: User): Promise<User>;
  setPayerIDtoUser(payerId: string, payerEmail: string): Promise<void>;
}
