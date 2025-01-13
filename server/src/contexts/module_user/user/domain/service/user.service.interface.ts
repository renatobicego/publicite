import { ClientSession, ObjectId, Types } from 'mongoose';

import { User, UserPreferences } from '../entity/user.entity';
import { ContactRequest } from '../../application/adapter/dto/HTTP-REQUEST/user.request.CREATE';
import { UserPersonalUpdateDto } from '../entity/dto/user.personal.update.dto';
import { UserBusinessUpdateDto } from '../entity/dto/user.business.update.dto';
import { UserPreferencesEntityDto } from '../entity/dto/user.preferences.update.dto';
import { UP_clerkUpdateRequestDto } from 'src/contexts/module_webhook/clerk/application/dto/UP-clerk.update.request';
import { UserFindAllResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';

export interface UserServiceInterface {
  createContact(
    contactDto: ContactRequest,
    options?: { session?: ClientSession },
  ): Promise<Types.ObjectId>;

  createUser(req: User, contactDto: ContactRequest): Promise<string>;

  findAllUsers(
    user: string,
    limit: number,
    page: number,
  ): Promise<UserFindAllResponse>;

  findUserByUsername(username: string, userRequestId?: string): Promise<any>;

  getUserPersonalInformationByUsername(username: string): Promise<any>;
  getRelationsFromUserByUserId(userRequestId: string): Promise<any>;
  isThisUserAllowedToPost(author: string, postBehaviourType: string): Promise<boolean>;
  getUserPreferencesByUsername(
    username: string,
  ): Promise<UserPreferences | null>;

  getPostAndLimitsFromUserByUserId(author: string): Promise<any>
  makeFriendRelationBetweenUsers(
    backData: { userIdFrom: string; userIdTo: string },
    typeOfRelation: string,
    session: any,
  ): Promise<string | null>;

  pushNewFriendRequestOrRelationRequestToUser(
    notificationId: Types.ObjectId,
    userNotificationOwner: string,
    session: any,
  ): Promise<any>;

  pushNotificationToUserArrayNotifications(
    notificationId: Types.ObjectId,
    userIdTo: string,
    session?: any,
  ): Promise<any>;

  removeFriendRequest(
    previousNotificationId: string,
    userNotificationOwner: string,
    session: any,
  ): Promise<any>;

  removeFriend(relationId: string, friendRequestId?: string): Promise<any>;


  saveNewPostInUser(
    postId: String,
    authorId: String,
    options?: { session?: ClientSession },
  ): Promise<any>;

  setSubscriptionToUser(
    external_reference: string,
    sub_id: any,
    sesion: any
  ): Promise<any>;
  updateFriendRelationOfUsers(
    userRelationId: string,
    typeOfRelation: string,
    session: any,
  ): Promise<void>;

  updateUser(
    username: string,
    req: UserPersonalUpdateDto | UserBusinessUpdateDto,
    type: number,
  ): Promise<UserPersonalUpdateDto | UserBusinessUpdateDto>;

  updateUserByClerkId(req: UP_clerkUpdateRequestDto): Promise<any>;

  updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferencesEntityDto,
  ): Promise<UserPreferencesEntityDto | null>;
}
