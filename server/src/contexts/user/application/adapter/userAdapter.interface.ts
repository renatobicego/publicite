import { UB_publiciteUpdateRequestDto } from '../../infraestructure/controller/dto/update.request-DTO/UB-publicite.update.request';
import { UP_publiciteUpdateRequestDto } from '../../infraestructure/controller/dto/update.request-DTO/UP-publicite.update.request';
import {
  UserBusinessDto,
  UserBusinessResponse,
} from '../../infraestructure/controller/dto/user.business.DTO';
import {
  UserPersonDto,
  UserPersonResponse,
} from '../../infraestructure/controller/dto/user.person.DTO';
import { UserPreferenceResponse } from './dto/userPreferences.response';

export interface UserAdapterInterface {
  createUser(
    req: UserPersonDto | UserBusinessDto,
    type: number,
  ): Promise<UserPersonResponse | UserBusinessResponse>;

  updateUser(
    username: string,
    req: UP_publiciteUpdateRequestDto | UB_publiciteUpdateRequestDto,
    type: number,
  ): Promise<any>;

  getUserPersonalInformationByUsername(username: string): Promise<any>;
  getUserPreferencesByUsername(username: string): Promise<UserPreferenceResponse | null>;
  updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferenceResponse,
  ): Promise<UserPreferenceResponse>;
}
