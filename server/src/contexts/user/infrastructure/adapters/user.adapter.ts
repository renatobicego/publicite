import { Inject, Injectable } from '@nestjs/common';

import { UserAdapterInterface } from '../../application/adapter/userAdapter.interface';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { UserServiceInterface } from '../../domain/service/user.service.interface';

import { UserMapperInterface } from '../../application/adapter/mapper/user.mapper.interface';
import {
  UserFindAllResponse,
  UserResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import {
  UserPreferencesRequest,
  UserRequest,
} from '../../application/adapter/dto/HTTP-REQUEST/user.request.CREATE';
import { businessAccountUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/user.business.request.UPDATE';
import { personalAccountUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/user.personal.request.UPDATE';
import { UserPersonalUpdateResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.personal.response.UPDATE';
import { UserBusinessUpdateResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.business.response.UPDATE';
import { UserPersonalInformationResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.information.response';
import { UserPreferenceResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.preferences.response';

@Injectable()
export class UserAdapter implements UserAdapterInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
    @Inject('UserMapperInterface')
    private readonly userMapper: UserMapperInterface,
  ) {}

  async createUser(req: UserRequest): Promise<UserResponse> {
    let userMapped;
    let userCreated;

    if (!req.userType) {
      throw new Error('Invalid user type');
    }

    try {
      switch (req.userType.toLowerCase()) {
        case 'person': {
          this.logger.log('We are creating a persona account');
          userMapped = this.userMapper.requestToEntity(req);

          userCreated = await this.userService.createUser(
            userMapped,
            req?.contact,
          );
          return this.userMapper.entityToResponse(userCreated);
        }
        case 'business': {
          this.logger.log('We are creating a persona account');
          userMapped = this.userMapper.requestToEntity(req);
          userCreated = await this.userService.createUser(
            userMapped,
            req?.contact,
          );
          return this.userMapper.entityToResponse(userCreated);
        }
        default: {
          throw new Error('Invalid user type');
        }
      }
    } catch (error: any) {
      throw error;
    }
  }
  async findAllUsers(
    user: string,
    limit: number,
    page: number,
  ): Promise<UserFindAllResponse> {
    try {
      return await this.userService.findAllUsers(user, limit, page);
    } catch (error: any) {
      throw error;
    }
  }
  async findUserByUsername(username: string): Promise<any> {
    try {
      return await this.userService.findUserByUsername(username);
    } catch (error: any) {
      throw error;
    }
  }

  async getUserPreferencesByUsername(username: string): Promise<any> {
    try {
      const userPreference =
        await this.userService.getUserPreferencesByUsername(username);
      if (!userPreference) return null;
      const userPreferenceResponse: UserPreferenceResponse = {
        searchPreference: userPreference?.searchPreference ?? [],
        backgroundColor: userPreference?.backgroundColor ?? undefined,
      };
      return userPreferenceResponse;
    } catch (error: any) {
      throw error;
    }
  }

  async getUserPersonalInformationByUsername(
    username: string,
  ): Promise<UserPersonalInformationResponse> {
    try {
      return await this.userService.getUserPersonalInformationByUsername(
        username,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async updateUser(
    username: string,
    req: businessAccountUpdateRequest | personalAccountUpdateRequest,
    type: number,
  ): Promise<UserPersonalUpdateResponse | UserBusinessUpdateResponse> {
    this.logger.log('Start udpate process in the adapter: Update');
    let userMapped;
    let userUpdated;
    // 0 -> Personal Account | 1 -> Business Account
    if (type === 0) {
      userMapped = this.userMapper.requestToEntity_update(req, 0);
      userUpdated = await this.userService.updateUser(
        username,
        userMapped,
        type,
      );
      return this.userMapper.entityToResponse_update(userUpdated, 0);
    } else if (type === 1) {
      userMapped = this.userMapper.requestToEntity_update(req, 1);
      userUpdated = await this.userService.updateUser(
        username,
        userMapped,
        type,
      );
      return this.userMapper.entityToResponse_update(userUpdated, 1);
    } else {
      throw new Error('Invalid user type');
    }
  }

  async updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferencesRequest,
  ): Promise<UserPreferenceResponse | null> {
    try {
      this.logger.log(
        'Start process in the adapter: Update preferences - Sending request to the service',
      );
      const userPreferencesMapped =
        this.userMapper.requestToEntity_userPreferences(userPreference);
      const userPreferencesUpdated =
        await this.userService.updateUserPreferencesByUsername(
          username,
          userPreferencesMapped,
        );
      if (!userPreferencesUpdated) return null;
      return this.userMapper.entityToResponse_userPreferences(
        userPreferencesUpdated,
      );
    } catch (error: any) {
      throw error;
    }
  }
}
