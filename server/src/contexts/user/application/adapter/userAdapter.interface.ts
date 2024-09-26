import { businessAccountUpdateRequest } from './dto/HTTP-REQUEST/user.business.request.UPDATE';
import { personalAccountUpdateRequest } from './dto/HTTP-REQUEST/user.personal.request.UPDATE';
import { UserPreferenceResponse } from './dto/HTTP-RESPONSE/user.preferences.response';
import { UserRequest } from './dto/HTTP-REQUEST/user.request.CREATE';
import { UserBusinessUpdateResponse } from './dto/HTTP-RESPONSE/user.business.response.UPDATE';
import { UserPersonalInformationResponse } from './dto/HTTP-RESPONSE/user.information.response';
import { UserPersonalUpdateResponse } from './dto/HTTP-RESPONSE/user.personal.response.UPDATE';
import {
  UserFindAllResponse,
  UserResponse,
} from './dto/HTTP-RESPONSE/user.response.dto';

export interface UserAdapterInterface {
  createUser(req: UserRequest): Promise<UserResponse>;

  updateUser(
    username: string,
    req: businessAccountUpdateRequest | personalAccountUpdateRequest,
    type: number,
  ): Promise<UserPersonalUpdateResponse | UserBusinessUpdateResponse>;

  getUserPersonalInformationByUsername(
    username: string,
  ): Promise<UserPersonalInformationResponse>;
  getUserPreferencesByUsername(
    username: string,
  ): Promise<UserPreferenceResponse | null>;
  updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferenceResponse,
  ): Promise<UserPreferenceResponse | null>;

  findAllUsers(user: string, limit: number): Promise<UserFindAllResponse>;
}
