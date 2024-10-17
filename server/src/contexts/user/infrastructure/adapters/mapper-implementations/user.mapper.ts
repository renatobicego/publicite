import {
  UserBusinessResponse,
  UserPersonResponse,
  UserResponse,
} from 'src/contexts/user/application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import { omitBy, isNil } from 'lodash';

import { UserMapperInterface } from 'src/contexts/user/application/adapter/mapper/user.mapper.interface';
import { User } from 'src/contexts/user/domain/entity/user.entity';
import { UserPerson } from '../../../domain/entity/userPerson.entity';
import { UserBusiness } from 'src/contexts/user/domain/entity/userBusiness.entity';
import { UserBusinessUpdateDto } from 'src/contexts/user/domain/entity/dto/user.business.update.dto';
import { UserPersonalUpdateDto } from 'src/contexts/user/domain/entity/dto/user.personal.update.dto';
import { UserBusinessUpdateResponse } from 'src/contexts/user/application/adapter/dto/HTTP-RESPONSE/user.business.response.UPDATE';
import { UserPersonalUpdateResponse } from 'src/contexts/user/application/adapter/dto/HTTP-RESPONSE/user.personal.response.UPDATE';
import { UserPreferencesRequest } from 'src/contexts/user/application/adapter/dto/HTTP-REQUEST/user.request.CREATE';
import { UserPreferenceResponse } from 'src/contexts/user/application/adapter/dto/HTTP-RESPONSE/user.preferences.response';
import { UserPreferencesEntityDto } from 'src/contexts/user/domain/entity/dto/user.preferences.update.dto';

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
  requestToEntity(request: any): User {
    const userBase = new User(
      request.clerkId,
      request.email,
      request.username,
      request.description,
      request.profilePhotoUrl,
      request.countryRegion,
      request.isActive,
      request.name,
      request.lastName,
      undefined, // contact undefined
      request.createdTime,
      request.subscriptions,
      request.groups,
      request.magazines,
      request.board,
      request.post,
      request.userRelations,
      request.userType,
      request.userPreferences,
    );

    switch (request.userType.toLocaleLowerCase()) {
      case 'person': {
        return new UserPerson(userBase, request.gender, request.birthDate);
      }
      case 'business': {
        return new UserBusiness(userBase, request.sector, request.businessName);
      }
      default: {
        throw new Error('Invalid user type');
      }
    }
  }
  entityToResponse(entity: User): UserResponse {
    let caster: any;
    const userBase: UserResponse = {
      _id: entity.getId as any,
      clerkId: entity.getClerkId,
      email: entity.getEmail,
      username: entity.getUsername,
      description: entity.getDescription,
      profilePhotoUrl: entity.getProfilePhotoUrl,
      countryRegion: entity.getCountryRegion,
      isActive: entity.getIsActive,
      contact: entity.getContact as any,
      createdTime: entity.getCreatedTime as string,
      subscriptions: entity.getSubscriptions as [],
      groups: entity.getGroups as [],
      magazines: entity.getMagazines as [],
      board: entity.getBoard as any,
      posts: entity.getPost as [],
      userRelations: entity.getUserRelations as [],
      userType: entity.getUserType as any,
      name: entity.getName,
      lastName: entity.getLastName,
      userPreferences: entity.getUserPreferences as any,
    };

    switch (entity.getUserType?.toLocaleLowerCase()) {
      case 'person': {
        caster = entity as UserPerson;
        const userPersonResponnse: UserPersonResponse = {
          ...userBase,
          gender: caster.getGender,
          birthDate: caster.getBirthDate,
        };
        return userPersonResponnse;
      }
      case 'business': {
        caster = entity as UserBusiness;
        const userBusinessResponse: UserBusinessResponse = {
          ...userBase,
          sector: caster.getSector as any,
          businessName: caster.getBusinessName as any,
        };

        return userBusinessResponse;
      }
      default: {
        throw new Error('Invalid user type');
      }
    }
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
