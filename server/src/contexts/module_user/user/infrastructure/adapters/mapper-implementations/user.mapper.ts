import { omitBy, isNil } from 'lodash';

import { UserMapperInterface } from '../../../application/adapter/mapper/user.mapper.interface';
import { UserPreferencesRequest } from '../../../application/adapter/dto/HTTP-REQUEST/user.request.CREATE';
import { UserPreferencesEntityDto } from '../../../domain/entity/dto/user.preferences.update.dto';
import { UserPreferenceResponse } from '../../../application/adapter/dto/HTTP-RESPONSE/user.preferences.response';
import { UserBusinessUpdateResponse } from '../../../application/adapter/dto/HTTP-RESPONSE/user.business.response.UPDATE';
import { UserPersonalUpdateResponse } from '../../../application/adapter/dto/HTTP-RESPONSE/user.personal.response.UPDATE';
import { UserBusinessUpdateDto } from '../../../domain/entity/dto/user.business.update.dto';
import { UserPersonalUpdateDto } from '../../../domain/entity/dto/user.personal.update.dto';


export class UserMapper implements UserMapperInterface {
  requestToEntity_userPreferences(
    request: UserPreferencesRequest,
  ): UserPreferencesEntityDto {
    return new UserPreferencesEntityDto(
      request.searchPreference,
      request.backgroundColor ?? undefined,
    );
  }
  entityToResponse_userPreferences(
    entity: UserPreferencesEntityDto,
  ): UserPreferenceResponse {
    const searchPref = entity.getSearchPreference;
    const backgroundColor = entity.getBackgroundColor;

    const userPrefResponse: UserPreferenceResponse = {
      searchPreference: searchPref ?? [],
      backgroundColor: backgroundColor ?? undefined,
    };
    return userPrefResponse;
  }



  requestToEntity_update(
    request: any,
    type: number,
  ): UserPersonalUpdateDto | UserBusinessUpdateDto {
    // 0 -> Personal Account | 1 -> Business Account
    try {
      if (type === 0) {
        return new UserPersonalUpdateDto({
          birthDate: request.birthDate,
          gender: request.gender,
          countryRegion: request.countryRegion,
          description: request.description,
        });
      } else if (type === 1) {
        return new UserBusinessUpdateDto({
          businessName: request.businessName,
          sector: request.sector,
          countryRegion: request.countryRegion,
          description: request.description,
        });
      } else {
        throw new Error('Invalid user type');
      }
    } catch (error: any) {
      throw error;
    }
  }

  entityToResponse_update(
    entity: UserPersonalUpdateDto | UserBusinessUpdateDto,
    type: number,
  ): UserPersonalUpdateResponse | UserBusinessUpdateResponse {
    if (type === 0) {
      const caster = entity as UserPersonalUpdateDto;
      const userUpdate: UserPersonalUpdateResponse = {
        birthDate: caster.getBirthDate,
        gender: caster.getGender,
        countryRegion: caster.getCountryRegion,
        description: caster.getDescription,
      };

      return omitBy(userUpdate, isNil);
    } else if (type === 1) {
      const caster = entity as UserBusinessUpdateDto;
      const userUpdated: UserBusinessUpdateResponse = {
        businessName: caster.getBusinessName,
        sector: caster.getSector,
        countryRegion: caster.getCountryRegion,
        description: caster.getDescription,
      };

      return omitBy(userUpdated, isNil);
    } else {
      throw new Error('Invalid user type');
    }
  }
}
