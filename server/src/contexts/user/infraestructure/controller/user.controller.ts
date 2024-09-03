import { Body, Controller, Inject, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserPersonDto, UserPersonResponse } from './dto/user.person.DTO';
import { UserBusinessDto, UserBusinessResponse } from './dto/user.business.DTO';
import { UserAdapterInterface } from '../../application/adapter/userAdapter.interface';
import { UP_publiciteUpdateRequestDto } from './dto/update.request-DTO/UP-publicite.update.request';

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
    type: [UP_publiciteUpdateRequestDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
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
}
