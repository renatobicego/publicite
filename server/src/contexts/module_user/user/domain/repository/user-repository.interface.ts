import { ClientSession, ObjectId, Types } from 'mongoose';
import { User, UserPreferences } from '../entity/user.entity';
import { UserPerson } from '../entity/userPerson.entity';
import { UserBusiness } from '../entity/userBusiness.entity';
import { UserBusinessUpdateDto } from '../entity/dto/user.business.update.dto';
import { UserPersonalUpdateDto } from '../entity/dto/user.personal.update.dto';
import { UserPreferencesEntityDto } from '../entity/dto/user.preferences.update.dto';
import { UP_clerkUpdateRequestDto } from 'src/contexts/module_webhook/clerk/application/dto/UP-clerk.update.request';
import { UserClerkUpdateDto } from '../entity/dto/user.clerk.update.dto';
import { UserFindAllResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import { UserRelation } from '../entity/userRelation.entity';

export interface UserRepositoryInterface {
  findAllUsers(
    user: string,
    limit: number,
    page: number,
  ): Promise<UserFindAllResponse>;
  findUserByUsername(user: string): Promise<any>;

  getUserPersonalInformationByUsername(
    username: string,
  ): Promise<any>;

  getUserPreferencesByUsername(
    username: string,
  ): Promise<UserPreferences | null>;

  getRelationsFromUserByUserId(userRequestId: string): Promise<any>

  getPostAndLimitsFromUserByUserId(author: string): Promise<any>

  pushNotification(notification: any, userId: string, session?: any): Promise<any>;
  pushNewFriendRequestOrRelationRequestToUser(notificationId: Types.ObjectId, userNotificationOwner: string, session: any): Promise<any>

  save(reqUser: User, session?: ClientSession): Promise<string>;

  saveBusinessAccount(
    baseObj: any,
    user: UserBusiness,
    options?: { session?: ClientSession },
  ): Promise<User>;

  saveNewPost(
    postId: String,
    authorId: String,
    options?: { session?: ClientSession },
  ): Promise<any>;
  setSubscriptionToUser(external_reference: string, sub_id: any, session: any): Promise<any>
  savePersonalAccount(
    baseObj: any,
    user: UserPerson,
    options?: { session?: ClientSession },
  ): Promise<User>;
  setNewActiveUserRelations(activeRelations: string[],userRequestId:string ):Promise<any>;
  removeFriendRequest(previousNotificationId: string, userNotificationOwner: string, session: any): Promise<any>
  removeFriend(relationId: string, friendRequestId?: string): Promise<any>;

  makeFriendRelationBetweenUsers(userRelation: UserRelation, session: any): Promise<string | null>
  update(
    username: string,
    reqUser: UserPersonalUpdateDto | UserBusinessUpdateDto,
    type: number,
  ): Promise<UserPersonalUpdateDto | UserBusinessUpdateDto>;

  updateFriendRelationOfUsers(
    userRelationId: string,
    typeOfRelation: string,
    session: any,
  ): Promise<void>;

  updateByClerkId(
    clerkId: string,
    reqUser: UP_clerkUpdateRequestDto,
  ): Promise<UserClerkUpdateDto>;

  updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferencesEntityDto,
  ): Promise<UserPreferencesEntityDto | null>;
}
