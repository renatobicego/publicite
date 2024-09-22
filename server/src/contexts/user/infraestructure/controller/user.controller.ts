import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserAdapterInterface } from '../../application/adapter/userAdapter.interface';

import { ClerkAuthGuard } from 'src/contexts/clerk-auth/clerk.auth.guard';
import {
  UserPersonRequestDto_SWAGGER,
  UserPersonResponseDto_SWAGGER,
} from './swagger/user.person.dto.swagger';

import {
  UserBusinessRequestDto_SWAGGER,
  UserBusinessResponseDto_SWAGGER,
} from './swagger/user.business.dto.swagger';
import {
  UserBusinessResponse,
  UserPersonResponse,
  UserResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';
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

@ApiTags('Accounts')
@Controller('user')
export class UserController {
  constructor(
    @Inject('UserAdapterInterface')
    private readonly userAdapter: UserAdapterInterface,
  ) {}

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
  ): Promise<UserResponse> {
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
  ): Promise<UserResponse> {
    try {
      return (await this.userAdapter.createUser(
        requestNewUser,
      )) as unknown as UserBusinessResponse;
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
  async updatePersonalAccount(
    @Body() updateRequest: personalAccountUpdateRequest,
    @Param('username') username: string,
  ): Promise<UserPersonResponse> {
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
  async updateBusinessAccount(
    @Body() updateRequest: businessAccountUpdateRequest,
    @Param('username') username: string,
  ): Promise<UserBusinessResponse> {
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
  async getUserPreferences(
    @Param('username') username: string,
  ): Promise<UserPreferenceResponse | null> {
    try {
      return this.userAdapter.getUserPreferencesByUsername(username);
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

  @Get('/auth')
  @UseGuards(ClerkAuthGuard)
  async test_auth(): Promise<string> {
    return 'auth ok';
  }
}
