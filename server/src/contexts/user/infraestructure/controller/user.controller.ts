import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  UserPersonDto,
  UserPersonResponse,
} from '../../infraestructure/controller/dto/user.person.DTO';
import { UserBusinessDto, UserBusinessResponse } from './dto/user.business.DTO';
import { UserAdapterInterface } from '../../application/interface/userAdapter.interface';

@ApiTags('Accounts')
@Controller('user')
export class UserController {
  constructor(
    @Inject('UserAdapterInterface')
    private readonly userAdapter: UserAdapterInterface,
  ) {}

  @Post('/personal')
  @ApiOperation({ summary: 'Create a new personal user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: [UserPersonDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async createPersonalUserController(
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
  @ApiOperation({ summary: 'Create a new business user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: [UserBusinessDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async createBusinessUserController(
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
}
