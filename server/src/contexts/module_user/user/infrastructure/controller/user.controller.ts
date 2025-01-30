import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserAdapterInterface } from '../../application/adapter/userAdapter.interface';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import {
  UserPersonRequestDto_SWAGGER,
  UserPersonResponseDto_SWAGGER,
} from './swagger/user.person.dto.swagger';

import {
  UserBusinessRequestDto_SWAGGER,
  UserBusinessResponseDto_SWAGGER,
} from './swagger/user.business.dto.swagger';

import { PersonalUpdateRequest_SWAGGER } from './swagger/update/UP-publicite.update.request';
import { personalAccountUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/user.personal.request.UPDATE';
import { BusinessUpdateRequest_SWAGGER } from './swagger/update/UB-publicite.update.request';
import {
  UserPersonRequest,
  UserBusinessRequest,
  UserPreferencesRequest,
} from '../../application/adapter/dto/HTTP-REQUEST/user.request.CREATE';
import { businessAccountUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/user.business.request.UPDATE';
import { UserPreferenceResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.preferences.response';
import { UserPreferencesDto_SWAGGER } from './swagger/user.preferences.dto.swagger';
import { UserFindAllResponseDto_SWAGGER } from './swagger/user.findAll.response.swagger';
import {
  UserBusinessResponse,
  UserPersonResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import { UserServiceInterface } from '../../domain/service/user.service.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { subscription_event } from 'src/contexts/module_shared/event-emmiter/events';

@ApiTags('Accounts')
@Controller('user')
export class UserController {
  constructor(
    @Inject('UserAdapterInterface')
    private readonly userAdapter: UserAdapterInterface,
    @Inject('UserServiceInterface')
    private readonly UserServiceInterface: UserServiceInterface,
    private readonly emmiter: EventEmitter2
  ) { }

  ///------------CONTROLLERS CREATE ACCOUNT-------------------
  @Post('/personal')
  @ApiOperation({ summary: 'Create a new personal account' })
  @ApiResponse({
    status: 201,
    description: 'The account has been successfully created.',
    type: [UserPersonResponseDto_SWAGGER],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: UserPersonRequestDto_SWAGGER })
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
  @ApiOperation({ summary: 'Create a new business account' })
  @ApiResponse({
    status: 201,
    description: 'The account has been successfully created.',
    type: [UserBusinessResponseDto_SWAGGER],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: UserBusinessRequestDto_SWAGGER })
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
  @ApiOperation({ summary: 'Update a new personal account' })
  @ApiResponse({
    status: 200,
    description: 'The account has been successfully Updated.',
    //type: [UserPersonResponseDto_SWAGGER],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: PersonalUpdateRequest_SWAGGER })
  @UseGuards(ClerkAuthGuard)
  async updatePersonalAccount(
    @Body() updateRequest: personalAccountUpdateRequest,
    @Param('username') username: string,
  ): Promise<any> {
    try {
      return (await this.userAdapter.updateUser(
        username,
        updateRequest,
        0,
      )) as UserPersonResponse;
    } catch (error: any) {
      throw error;
    }
  }

  @Put('/business/:username')
  @ApiOperation({ summary: 'Update a new business account' })
  @ApiResponse({
    status: 200,
    description: 'The account has been successfully Updated.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: BusinessUpdateRequest_SWAGGER })
  @UseGuards(ClerkAuthGuard)
  async updateBusinessAccount(
    @Body() updateRequest: businessAccountUpdateRequest,
    @Param('username') username: string,
  ): Promise<any> {
    try {
      return (await this.userAdapter.updateUser(
        username,
        updateRequest,
        1,
      )) as UserBusinessResponse;
    } catch (error: any) {
      throw error;
    }
  }

  ///------------CONTROLLERS GET  ACCOUNT-------------------

  @Get('/personal-data/:username')
  @ApiOperation({ summary: 'Get profile information of particular account' })
  @ApiResponse({
    status: 200,
    description: "Data it's correct.",
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
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
  @ApiOperation({ summary: 'Get profile preferences of particular account' })
  @ApiResponse({
    status: 200,
    description: "Data it's correct.",
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
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
  @ApiOperation({ summary: 'Update a new business account' })
  @ApiResponse({
    status: 200,
    description: 'The account has been successfully Updated.',
    type: [UserPreferencesDto_SWAGGER],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: UserPreferencesDto_SWAGGER })
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
  @ApiOperation({ summary: 'Get all users by username, lastName or Name' })
  @ApiResponse({
    status: 200,
    description: "Data it's correct.",
    type: [UserFindAllResponseDto_SWAGGER],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiQuery({
    name: 'user',
    required: true,
    type: String,
    description: 'Name, lastName or username of the user',
  })
  @ApiQuery({
    name: 'limit',
    required: true,
    type: Number,
    description: 'Number of users to return',
  })
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



  @Get("/test")
  async test(
  ): Promise<string> {
    try {
      const paymentDataFromMeli = {
        event: "payment_approved",
        subscriptionPlanId: "test_plan_id",
        reason: "test_reason",
        status: "test_status",
        retryAttemp: "test_retryAttemp",
        userId: "66fac933316723a55b9d0c90",
      }
      this.emmiter.emit(subscription_event, paymentDataFromMeli);
      return "asd"
    } catch (error: any) {
      throw error;
    }
  }

}
