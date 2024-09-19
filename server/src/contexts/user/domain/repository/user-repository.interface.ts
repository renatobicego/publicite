import { ClientSession, ObjectId } from 'mongoose';
import { User } from '../entity/user.entity';
import { UserBusiness } from '../entity/userBusiness.entity';
import { UP_update, UserPerson } from '../entity/userPerson.entity';
import { UP_clerkUpdateRequestDto } from 'src/contexts/webhook/application/clerk/dto/UP-clerk.update.request';
import { UserPreferences } from '../../infraestructure/schemas/user.schema';

export interface UserRepositoryInterface {
  save(
    reqUser: UserPerson | UserBusiness,
    type: number,
    session?: ClientSession,
  ): Promise<User>;
  getUserPersonalInformationByUsername(
    username: string,
  ): Promise<Partial<User>>;
  getUserPreferencesByUsername(
    username: string,
  ): Promise<UserPreferences | null>;
  update(username: string, reqUser: UP_update, type: number): Promise<User>;
  updateByClerkId(
    clerkId: string,
    reqUser: UP_clerkUpdateRequestDto,
  ): Promise<User>;

  updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferences,
  ): Promise<UserPreferences | null>;

  saveNewPost(
    postId: ObjectId,
    authorId: string,
    options?: { session?: ClientSession },
  ): Promise<any>;
}
