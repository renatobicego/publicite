import { ClientSession, ObjectId } from 'mongoose';
import { User, UserPreferences } from '../entity/user.entity';
import { UserPerson } from '../entity/userPerson.entity';
import { UserBusiness } from '../entity/userBusiness.entity';
import { UserBusinessUpdateDto } from '../entity/dto/user.business.update.dto';
import { UserPersonalUpdateDto } from '../entity/dto/user.personal.update.dto';
import { UserPreferencesEntityDto } from '../entity/dto/user.preferences.update.dto';
import { UP_clerkUpdateRequestDto } from 'src/contexts/webhook/application/clerk/dto/UP-clerk.update.request';
import { UserClerkUpdateDto } from '../entity/dto/user.clerk.update.dto';
import { UserFindAllResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import { GROUP_notification_graph_model_get_all } from '../../application/adapter/dto/HTTP-RESPONSE/notifications/user.notifications.response';

export interface UserRepositoryInterface {
  findAllUsers(
    user: string,
    limit: number,
    page: number,
  ): Promise<UserFindAllResponse>;
  findUserByUsername(user: string): Promise<any>;

  getUserPersonalInformationByUsername(
    username: string,
  ): Promise<Partial<User> | null>;

  getUserPreferencesByUsername(
    username: string,
  ): Promise<UserPreferences | null>;

  getAllNotificationsFromUserById(
    id: string,
    limit: number,
    page: number,
  ): Promise<GROUP_notification_graph_model_get_all>;

  pushNotification(notification: any): Promise<any>;

  save(reqUser: User, session?: ClientSession): Promise<User>;

  saveBusinessAccount(
    baseObj: any,
    user: UserBusiness,
    options?: { session?: ClientSession },
  ): Promise<User>;

  saveNewPost(
    postId: ObjectId,
    authorId: ObjectId,
    options?: { session?: ClientSession },
  ): Promise<any>;

  savePersonalAccount(
    baseObj: any,
    user: UserPerson,
    options?: { session?: ClientSession },
  ): Promise<User>;

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
}
