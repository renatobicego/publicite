import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';


import { UserAdapterInterface } from '../../application/adapter/userAdapter.interface';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';


import { personalAccountUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/user.personal.request.UPDATE';

import {
  UserPersonRequest,
  UserBusinessRequest,
  UserPreferencesRequest,
} from '../../application/adapter/dto/HTTP-REQUEST/user.request.CREATE';
import { businessAccountUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/user.business.request.UPDATE';
import { UserPreferenceResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.preferences.response';
import {
  UserBusinessResponse,
  UserPersonResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import { UserType } from '../../domain/entity/enum/user.enums';
import { AuthSocket } from 'src/contexts/module_socket/infrastructure/auth/socket.auth';


@Controller('user')
export class UserController {
  constructor(
    @Inject('UserAdapterInterface')
    private readonly userAdapter: UserAdapterInterface,
  ) {}

  ///------------CONTROLLERS CREATE ACCOUNT-------------------
  @Post('/personal')
  async createPersonalAccount(
    @Body() requesNewtUser: UserPersonRequest,
  ): Promise<string> {
    try {
      return await this.userAdapter.createUser(requesNewtUser);
    } catch (error: any) {
      throw error;
    }
  }

  @Post('/business')
  async createBusinessAccount(
    @Body() requestNewUser: UserBusinessRequest,
  ): Promise<string> {
    try {
      return await this.userAdapter.createUser(requestNewUser);
    } catch (error: any) {
      throw error;
    }
  }

  ///------------CONTROLLERS UPDATE ACCOUNT-------------------

  @Put('/personal/:username')
  @UseGuards(ClerkAuthGuard)
  async updatePersonalAccount(
    @Body() updateRequest: personalAccountUpdateRequest,
    @Param('username') username: string,
  ): Promise<any> {
    try {
      return (await this.userAdapter.updateUser(
        username,
        updateRequest,
        UserType.Person,
      )) as UserPersonResponse;
    } catch (error: any) {
      throw error;
    }
  }

  @Put('/business/:username')
  @UseGuards(ClerkAuthGuard)
  async updateBusinessAccount(
    @Body() updateRequest: businessAccountUpdateRequest,
    @Param('username') username: string,
  ): Promise<any> {
    try {
      return (await this.userAdapter.updateUser(
        username,
        updateRequest,
        UserType.Business,
      )) as UserBusinessResponse;
    } catch (error: any) {
      throw error;
    }
  }

  ///------------CONTROLLERS GET  ACCOUNT-------------------

  @Get('/personal-data/:username')
  @UseGuards(ClerkAuthGuard)
  async getPersonalInformation(
    @Param('username') username: string,
  ): Promise<any> {
    try {
      return this.userAdapter.getUserPersonalInformationByUsername(username);
    } catch (error: any) {
      throw error;
    }
  }

  @Get('/preferences/:username')
  @UseGuards(ClerkAuthGuard)
  async getUserPreferences(
    @Param('username') username: string,
  ): Promise<UserPreferenceResponse | null> {
    try {
      return await this.userAdapter.getUserPreferencesByUsername(username);
    } catch (error: any) {
      throw error;
    }
  }

  @Put('/user-preferences/:username')
  @UseGuards(ClerkAuthGuard)
  async updateUserPreferences(
    @Body() userPreference: UserPreferencesRequest,
    @Param('username') username: string,
  ): Promise<UserPreferenceResponse | null> {
    try {
      return await this.userAdapter.updateUserPreferencesByUsername(
        username,
        userPreference,
      );
    } catch (error: any) {
      throw error;
    }
  }

  @Get()
  async getAllUsers(
    @Query('user') user: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ): Promise<any> {
    try {
      const users = await this.userAdapter.findAllUsers(user, limit, page);
      return users;
    } catch (error: any) {
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(AuthSocket)
  async deleteAccount(@Param('id') id: string): Promise<any> {
    try {
      const mongoID = await this.userAdapter.deleteAccount(id);
      return { mongoID };
    } catch (error: any) {
      throw error;
    }
  }


  // @Get("/test")
  // async test(
  // ): Promise<string> {
  //   try {
  //     const paymentDataFromMeli = {
  //       event: "payment_approved",
  //       subscriptionPlanId: "test_plan_id",
  //       reason: "test_reason",
  //       status: "test_status",
  //       retryAttemp: "test_retryAttemp",
  //       userId: "66fac933316723a55b9d0c90",
  //     }
  //     await this.emmiter.emitAsync(subscription_event, paymentDataFromMeli);
  //     return "asd"
  //   } catch (error: any) {
  //     throw error;
  //   }
  // }
}
