import { businessAccountUpdateRequest } from './dto/HTTP-REQUEST/user.business.request.UPDATE';
import { personalAccountUpdateRequest } from './dto/HTTP-REQUEST/user.personal.request.UPDATE';
import { UserPreferenceResponse } from './dto/HTTP-RESPONSE/user.preferences.response';
import { UserRequest } from './dto/HTTP-REQUEST/user.request.CREATE';
import { UserBusinessUpdateResponse } from './dto/HTTP-RESPONSE/user.business.response.UPDATE';
import { UserPersonalInformationResponse } from './dto/HTTP-RESPONSE/user.information.response';
import { UserPersonalUpdateResponse } from './dto/HTTP-RESPONSE/user.personal.response.UPDATE';
import { UserFindAllResponse } from './dto/HTTP-RESPONSE/user.response.dto';
import { UserType } from '../../domain/entity/enum/user.enums';

export interface UserAdapterInterface {
  createUser(req: UserRequest): Promise<string>;
  deleteAccount(id: string): Promise<any>;
  downgradeplan(userId: string): Promise<any>;
  findAllUsers(
    user: string,
    limit: number,
    page: number,
  ): Promise<UserFindAllResponse>;

  getUsersOfAllApp(): Promise<any>;

  findUserById(_id: string, userRequestId?: string): Promise<any>;

  getUserPersonalInformationByUsername(
    username: string,
  ): Promise<UserPersonalInformationResponse>;
  getUserPreferencesByUsername(
    username: string,
  ): Promise<UserPreferenceResponse | null>;
  getActiveRelationsOfUser(userRequestId: string): Promise<any>;

  removeFriend(relationId: string, friendRequestId?: string): Promise<any>;
  setNewActiveUserRelations(
    activeRelations: string[],
    userRequestId: string,
  ): Promise<any>;
  updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferenceResponse,
  ): Promise<UserPreferenceResponse | null>;

  updateUser(
    username: string,
    req: businessAccountUpdateRequest | personalAccountUpdateRequest,
    type: UserType,
  ): Promise<UserPersonalUpdateResponse | UserBusinessUpdateResponse>;
}
