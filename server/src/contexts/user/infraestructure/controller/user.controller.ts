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

import { UserPersonDto, UserPersonResponse } from './dto/user.person.DTO';
import { UserBusinessDto, UserBusinessResponse } from './dto/user.business.DTO';
import { UserAdapterInterface } from '../../application/adapter/userAdapter.interface';
import { UP_publiciteUpdateRequestDto } from './dto/update.request-DTO/UP-publicite.update.request';
import { UB_publiciteUpdateRequestDto } from './dto/update.request-DTO/UB-publicite.update.request';
import { UserPreferences } from './dto/userPreferenceDTO';
import { UserPreferencesDto } from './swagger/userPreferenceDTO.swagger';
import { UserPreferenceResponse } from '../../application/adapter/dto/userPreferences.response';
import { ClerkAuthGuard } from 'src/contexts/clerk-auth/clerk.auth.guard';

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
    type: [UserPersonDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: UserPersonDto })
  async createPersonalAccount(
    @Body() requesNewtUser: UserPersonDto,
  ): Promise<UserPersonResponse> {
    try {
      return (await this.userAdapter.createUser(
        requesNewtUser,
        0,
      )) as UserPersonResponse;
    } catch (error: any) {
      throw error;
    }
  }

  @Post('/business')
  @ApiOperation({ summary: 'Create a new business account' })
  @ApiResponse({
    status: 201,
    description: 'The account has been successfully created.',
    type: [UserBusinessDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: UserBusinessDto })
  async createBusinessAccount(
    @Body() requestNewUser: UserBusinessDto,
  ): Promise<UserBusinessResponse> {
    try {
      return (await this.userAdapter.createUser(
        requestNewUser,
        1,
      )) as UserBusinessResponse;
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
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: UP_publiciteUpdateRequestDto })
  async updatePersonalAccount(
    @Body() updateRequest: UP_publiciteUpdateRequestDto,
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
  @ApiBody({ type: UB_publiciteUpdateRequestDto })
  async updateBusinessAccount(
    @Body() updateRequest: UB_publiciteUpdateRequestDto,
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
  ): Promise<UserBusinessResponse> {
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
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: UserPreferencesDto })
  async updateUserPreferences(
    @Body() userPreference: UserPreferences,
    @Param('username') username: string,
  ): Promise<UserPreferenceResponse> {
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
