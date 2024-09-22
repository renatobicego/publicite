import { ClientSession, ObjectId } from 'mongoose';
import { User, UserPreferences } from '../entity/user.entity';

import { UserPerson } from '../entity/userPerson.entity';

import { UserBusiness } from '../entity/userBusiness.entity';
import { UserBusinessUpdateDto } from '../entity/dto/user.business.update.dto';
import { UserPersonalUpdateDto } from '../entity/dto/user.personal.update.dto';
import { UserPreferencesEntityDto } from '../entity/dto/user.preferences.update.dto';
import { UP_clerkUpdateRequestDto } from 'src/contexts/webhook/application/clerk/dto/UP-clerk.update.request';
import { UserClerkUpdateDto } from '../entity/dto/user.clerk.update.dto';

export interface UserRepositoryInterface {
  save(reqUser: User, session?: ClientSession): Promise<User>;
  savePersonalAccount(
    baseObj: any,
    user: UserPerson,
    options?: { session?: ClientSession },
  ): Promise<User>;
  saveBusinessAccount(
    baseObj: any,
    user: UserBusiness,
    options?: { session?: ClientSession },
  ): Promise<User>;

  getUserPersonalInformationByUsername(
    username: string,
  ): Promise<Partial<User> | null>;
  getUserPreferencesByUsername(
    username: string,
  ): Promise<UserPreferences | null>;
  update(
    username: string,
    reqUser: UserPersonalUpdateDto | UserBusinessUpdateDto,
    type: number,
  ): Promise<UserPersonalUpdateDto | UserBusinessUpdateDto>;
  updateByClerkId(
    clerkId: string,
    reqUser: UP_clerkUpdateRequestDto,
  ): Promise<UserClerkUpdateDto>;

  updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferencesEntityDto,
  ): Promise<UserPreferencesEntityDto | null>;

  saveNewPost(
    postId: ObjectId,
    authorId: ObjectId,
    options?: { session?: ClientSession },
  ): Promise<any>;
}
