import { AdAgentProfile } from '../../application/functions/adAgent';
import { PayoutAccount } from '../../application/functions/payoutAccounts';
import { IdentityVerificationRecord } from 'src/contexts/module_user/identity/domain/identity.verification.types';
import { ClientSession, Types } from 'mongoose';

import { User, UserPreferences } from '../entity/user.entity';
import { ContactRequest } from '../../application/adapter/dto/HTTP-REQUEST/user.request.CREATE';
import { UserPersonalUpdateDto } from '../entity/dto/user.personal.update.dto';
import { UserBusinessUpdateDto } from '../entity/dto/user.business.update.dto';
import { UserPreferencesEntityDto } from '../entity/dto/user.preferences.update.dto';
import { UP_clerkUpdateRequestDto } from 'src/contexts/module_webhook/clerk/application/dto/UP-clerk.update.request';
import { UserFindAllResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import { UserType } from '../entity/enum/user.enums';
import { ProductionBehaviourType } from 'src/contexts/module_shared/production-limits/production.behaviour-type.enum';
import { ProductionOwnerType } from 'src/contexts/module_shared/production-limits/production.owner-type.enum';
import { ProductionLimits } from '../../application/functions/calculateProductionLimits';

export interface UserServiceInterface {
  createContact(
    contactDto: ContactRequest,
    options?: { session?: ClientSession },
  ): Promise<Types.ObjectId>;
  createUser(
    req: User,
    contactDto: ContactRequest,
    identityVerification?: IdentityVerificationRecord | null,
  ): Promise<string>;
  getUsersOfAllApp(): Promise<any>;
  deleteAccount(id: string): Promise<any>;
  removeActiveRelationOfUser(userId: string, session?: any): Promise<any>;

  findAllUsers(
    user: string,
    limit: number,
    page: number,
  ): Promise<UserFindAllResponse>;

  findUserByIdByOwnUser(username: string, userRequestId?: string): Promise<any>;
  findProfileUserByExternalUserById(
    _id: string,
    userRequestId?: string,
  ): Promise<any>;

  getUserPersonalInformationByUsername(username: string): Promise<any>;
  getRelationsFromUserByUserId(userRequestId: string): Promise<any>;
  getActiveRelationOfUser(userRequestId: string, session?: any): Promise<any>;
  getMongoIdByClerkId(clerk_id: string): Promise<void>;

  isThisUserAllowedToPost(
    author: string,
    postBehaviourType: string,
  ): Promise<boolean>;
  /** Mensaje de "no hay cupo" con cuántos anuncios tiene y cuántos tiene que desactivar. */
  getPostLimitMessage(
    userId: string,
    postBehaviourType: string,
    action: 'publicar uno nuevo' | 'activar este',
  ): Promise<string>;

  isThisUserAllowedToCreateBlog(
    ownerId: string,
    ownerType: ProductionOwnerType,
    session?: ClientSession,
    behaviourType?: ProductionBehaviourType,
  ): Promise<boolean>;
  getProductionLimitsFromUserByUserId(
    ownerId: string,
    session?: ClientSession,
  ): Promise<ProductionLimits>;
  getCredentialIdOfUser(userId: string): Promise<string | null>;
  getUserPreferencesByUsername(
    username: string,
  ): Promise<UserPreferences | null>;

  getPostAndContactLimit(author: string): Promise<{
    agendaPostCount: number;
    librePostCount: number;
    totalAgendaPostLimit: number;
    totalLibrePostLimit: number;
    agendaAvailable: number;
    libreAvailable: number;
    contactLimit: number;
    contactCount: number;
    contactAvailable: number;
    /** Extra temporal de cambio de plan: hasta cuándo y cómo quedan los límites sin él. */
    carryoverExpiresAt?: string | null;
    totalAgendaPostLimitAfterCarryover?: number | null;
    totalLibrePostLimitAfterCarryover?: number | null;
    contactLimitAfterCarryover?: number | null;
  }>;
  getPostAndLimitsFromUserByUserId(author: string): Promise<any>;
  getLimitContactsFromUserByUserId(
    userRequestId: string,
    session?: any,
  ): Promise<any>;

  makeFriendRelationBetweenUsers(
    backData: { userIdFrom: string; userIdTo: string },
    typeOfRelation: string,
    session: any,
  ): Promise<string | null>;

  pushNewFriendRequestOrRelationRequestToUser(
    notificationId: Types.ObjectId,
    backData: any,
    session: any,
  ): Promise<any>;

  pushNotificationToUserArrayNotifications(
    notificationId: Types.ObjectId,
    userIdTo: string,
    userIdFrom: string,
    session?: any,
  ): Promise<any>;

  removeFriendRequest(
    previousNotificationId: string,
    backData: {
      userIdFrom: string;
      userIdTo: string;
    },
    session: any,
  ): Promise<any>;

  removeFriend(relationId: string, friendRequestId?: string): Promise<any>;

  saveNewPostInUser(
    postId: string,
    authorId: string,
    options?: { session?: ClientSession },
  ): Promise<any>;
  saveNewProductionInUser(
    productionId: string,
    ownerId: string,
    options?: { session?: ClientSession },
  ): Promise<any>;
  removeProductionFromUser(
    productionId: string,
    ownerId: string,
    options?: { session?: ClientSession },
  ): Promise<any>;
  setNewActiveUserRelations(
    activeRelations: string[],
    userRequestId: string,
  ): Promise<any>;
  updateCredential(
    userRequestId: string,
    input: { credentialPhotoUrl?: string | null; credentialColor?: string | null },
  ): Promise<{
    credentialPhotoUrl: string | null;
    credentialColor: string | null;
    previousCredentialPhotoUrl: string | null;
  }>;
  getPayoutAccounts(userRequestId: string): Promise<PayoutAccount[]>;
  isAdAgent(userId: string): Promise<boolean>;
  getAdAgentProfile(userId: string): Promise<AdAgentProfile | null>;
  updateAdAgent(
    userRequestId: string,
    input: { website?: string; taxCondition?: string; taxNote?: string },
  ): Promise<AdAgentProfile>;
  updatePayoutAccounts(
    userRequestId: string,
    accounts: { label?: string | null; aliasCbu: string }[],
  ): Promise<PayoutAccount[]>;
  setSubscriptionToUser(
    external_reference: string,
    sub_id: any,
    sesion: any,
  ): Promise<any>;
  updateFriendRelationOfUsers(
    userRelationId: string,
    typeOfRelation: string,
    session: any,
  ): Promise<void>;

  updateUser(
    username: string,
    req: UserPersonalUpdateDto | UserBusinessUpdateDto,
    type: UserType,
  ): Promise<UserPersonalUpdateDto | UserBusinessUpdateDto>;

  updateUserByClerkId(req: UP_clerkUpdateRequestDto): Promise<any>;

  updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferencesEntityDto,
  ): Promise<UserPreferencesEntityDto | null>;
}
