import { Inject, Injectable } from '@nestjs/common';

import { UserAdapterInterface } from '../../application/adapter/userAdapter.interface';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserServiceInterface } from '../../domain/service/user.service.interface';

import { UserMapperInterface } from '../../application/adapter/mapper/user.mapper.interface';
import {
  UserFindAllResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import {
  UserPreferencesRequest,
  UserRequest,
} from '../../application/adapter/dto/HTTP-REQUEST/user.request.CREATE';
import { businessAccountUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/user.business.request.UPDATE';
import { personalAccountUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/user.personal.request.UPDATE';

import { UserPersonalInformationResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.information.response';
import { UserPreferenceResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.preferences.response';
import { UserFactory } from '../../application/service/user.factory';

@Injectable()
export class UserAdapter implements UserAdapterInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
    @Inject('UserMapperInterface')
    private readonly userMapper: UserMapperInterface,
  ) { }


  async createUser(newUserRequest: UserRequest): Promise<any> {

    if (!newUserRequest.userType) {
      throw new Error('Invalid user type');
    }

    try {
      const factory = UserFactory.getInstance(this.logger);
      const user = factory.createUser(newUserRequest.userType.toLowerCase(), newUserRequest);


      return await this.userService.createUser(
        user,
        newUserRequest?.contact,
      );


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
  async findUserByUsername(username: string, userRequestId?: string): Promise<any> {
    try {
      return await this.userService.findUserByUsername(username, userRequestId);
    } catch (error: any) {
      throw error;
    }
  }


  async getUserPreferencesByUsername(username: string): Promise<any> {
    try {
      const userPreference =
        await this.userService.getUserPreferencesByUsername(username);
      if (!userPreference)
        return {
          searchPreference: [],
          backgroundColor: undefined,
        };
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

  async removeFriend(relationId: string, friendRequestId?: string): Promise<any> {
    try {
      return await this.userService.removeFriend(relationId, friendRequestId);
    } catch (error: any) {
      throw error;
    }
  }

  async updateUser(
    username: string,
    req: businessAccountUpdateRequest | personalAccountUpdateRequest,
    type: number,
  ): Promise<any> {
    this.logger.log('Start udpate process in the adapter: Update');
    let userMapped;
    // 0 -> Personal Account | 1 -> Business Account
    if (type === 0) {
      userMapped = this.userMapper.requestToEntity_update(req, 0);
      return await this.userService.updateUser(
        username,
        userMapped,
        type,
      );

    } else if (type === 1) {
      userMapped = this.userMapper.requestToEntity_update(req, 1);
      return await this.userService.updateUser(
        username,
        userMapped,
        type,
      );

    } else {
      throw new Error('Invalid user type');
    }
  }

  async updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferencesRequest,
  ): Promise<any> {
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
      return userPreferencesUpdated;
    } catch (error: any) {
      throw error;
    }
  }
}

