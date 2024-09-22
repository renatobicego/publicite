import { User } from 'src/contexts/user/domain/entity/user.entity';
import { UserResponse } from '../dto/HTTP-RESPONSE/user.response.dto';
import { UserPersonalUpdateDto } from 'src/contexts/user/domain/entity/dto/user.personal.update.dto';
import { UserBusinessUpdateDto } from 'src/contexts/user/domain/entity/dto/user.business.update.dto';
import { UserPersonalUpdateResponse } from '../dto/HTTP-RESPONSE/user.personal.response.UPDATE';
import { UserBusinessUpdateResponse } from '../dto/HTTP-RESPONSE/user.business.response.UPDATE';
import { UserPreferencesEntityDto } from 'src/contexts/user/domain/entity/dto/user.preferences.update.dto';
import { UserPreferencesRequest } from '../dto/HTTP-REQUEST/user.request.CREATE';
import { UserPreferenceResponse } from '../dto/HTTP-RESPONSE/user.preferences.response';

export interface UserMapperInterface {
  requestToEntity(request: any): User;
  entityToResponse(entity: User): UserResponse;
  requestToEntity_update(
    request: any,
    type: number,
  ): UserPersonalUpdateDto | UserBusinessUpdateDto;

  entityToResponse_update(
    entity: UserPersonalUpdateDto | UserBusinessUpdateDto,
    type: number,
  ): UserPersonalUpdateResponse | UserBusinessUpdateResponse;

  requestToEntity_userPreferences(
    request: UserPreferencesRequest,
  ): UserPreferencesEntityDto;

  entityToResponse_userPreferences(
    entity: UserPreferencesEntityDto,
  ): UserPreferenceResponse;
}
