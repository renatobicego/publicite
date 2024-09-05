import { ClientSession } from 'mongoose';
import { User } from '../entity/user.entity';
import { UserBussiness } from '../entity/userBussiness.entity';
import { UP_update, UserPerson } from '../entity/userPerson.entity';
import { UP_clerkUpdateRequestDto } from 'src/contexts/webhook/application/clerk/dto/UP-clerk.update.request';

export interface UserRepositoryInterface {
  save(
    reqUser: UserPerson | UserBussiness,
    type: number,
    session?: ClientSession,
  ): Promise<User>;

  update(username: string, reqUser: UP_update, type: number): Promise<User>;
  updateByClerkId(
    clerkId: string,
    reqUser: UP_clerkUpdateRequestDto,
  ): Promise<User>;
  getUserPersonalInformationByUsername(
    username: string,
  ): Promise<Partial<User>>;
}
