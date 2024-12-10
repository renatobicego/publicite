import { UserResponse } from '../dto/HTTP-RESPONSE/user.response.dto';

import { UserPersonalUpdateResponse } from '../dto/HTTP-RESPONSE/user.personal.response.UPDATE';
import { UserBusinessUpdateResponse } from '../dto/HTTP-RESPONSE/user.business.response.UPDATE';
import { UserPreferencesRequest } from '../dto/HTTP-REQUEST/user.request.CREATE';
import { UserPreferenceResponse } from '../dto/HTTP-RESPONSE/user.preferences.response';
import { UserPreferencesEntityDto } from '../../../domain/entity/dto/user.preferences.update.dto';
import { UserBusinessUpdateDto } from '../../../domain/entity/dto/user.business.update.dto';
import { UserPersonalUpdateDto } from '../../../domain/entity/dto/user.personal.update.dto';
import { User } from '../../../domain/entity/user.entity';


export interface UserMapperInterface {


  requestToEntity_update(
    request: any,
    type: number,
  ): UserPersonalUpdateDto | UserBusinessUpdateDto;


  requestToEntity_userPreferences(
    request: UserPreferencesRequest,
  ): UserPreferencesEntityDto;


}
