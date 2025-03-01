import { Inject, Injectable } from '@nestjs/common';

import { UserAdapterInterface } from '../../application/adapter/userAdapter.interface';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserServiceInterface } from '../../domain/service/user.service.interface';
import { UserFindAllResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import {
  UserPreferencesRequest,
  UserRequest,
} from '../../application/adapter/dto/HTTP-REQUEST/user.request.CREATE';
import { businessAccountUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/user.business.request.UPDATE';
import { personalAccountUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/user.personal.request.UPDATE';
import { UserPersonalInformationResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.information.response';
import { UserPreferenceResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.preferences.response';
import { UserFactory } from '../../application/service/user.factory';
import { OnEvent } from '@nestjs/event-emitter';
import { downgrade_plan_contact } from 'src/contexts/module_shared/event-emmiter/events';
import { UserType } from '../../domain/entity/enum/user.enums';

@Injectable()
export class UserAdapter implements UserAdapterInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
  ) {}

  async createUser(newUserRequest: UserRequest): Promise<any> {
    if (!newUserRequest.userType) {
      throw new Error('UserType missing');
    }

    try {
      const factory = UserFactory.getInstance(this.logger);
      const user = factory.createUser(newUserRequest.userType, newUserRequest);

      return await this.userService.createUser(user, newUserRequest?.contact);
    } catch (error: any) {
      throw error;
    }
  }

  @OnEvent(downgrade_plan_contact)
  async downgradeplan(userId: string): Promise<any> {
    try {
      return await this.userService.removeActiveRelationOfUser(userId);
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
  async findUserById(_id: string, userRequestId: string): Promise<any> {
    try {
      if (_id == userRequestId) {
        this.logger.log('User id and user id from are the same');
        return await this.userService.findUserByIdByOwnUser(_id);
      }
      this.logger.log('User id and user id from are not the same');
      return await this.userService.findProfileUserByExternalUserById(_id);
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

  async getActiveRelationsOfUser(userRequestId: string): Promise<any> {
    try {
      return await this.userService.getActiveRelationOfUser(userRequestId);
    } catch (error: any) {
      throw error;
    }
  }

  async removeFriend(
    relationId: string,
    friendRequestId?: string,
  ): Promise<any> {
    try {
      return await this.userService.removeFriend(relationId, friendRequestId);
    } catch (error: any) {
      throw error;
    }
  }

  async setNewActiveUserRelations(
    activeRelations: string[],
    userRequestId: string,
  ): Promise<any> {
    try {
      return await this.userService.setNewActiveUserRelations(
        activeRelations,
        userRequestId,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async updateUser(
    username: string,
    req: businessAccountUpdateRequest | personalAccountUpdateRequest,
    type: UserType,
  ): Promise<any> {
    this.logger.log('Start udpate process in the adapter: Update');

    if (type === UserType.Person) {
      return await this.userService.updateUser(username, req, type);
    } else if (UserType.Business) {
      return await this.userService.updateUser(username, req, type);
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
      const userPreferencesUpdated =
        await this.userService.updateUserPreferencesByUsername(
          username,
          userPreference,
        );
      if (!userPreferencesUpdated) return null;
      return userPreferencesUpdated;
    } catch (error: any) {
      throw error;
    }
  }
}
