import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { ClerkAuthGuard } from 'src/contexts/clerk-auth/clerk.auth.guard';

import { GroupRequest } from 'src/contexts/group/application/adapter/dto/HTTP-REQUEST/group.request';
import {
  GroupListResponse,
  GroupResponse,
} from 'src/contexts/group/application/adapter/dto/HTTP-RESPONSE/group.response';

import { GroupAdapterInterface } from 'src/contexts/group/application/adapter/group.adapter.interface';
import { PubliciteAuth } from 'src/contexts/shared/publicite_auth/publicite_auth';

@Resolver('Group')
export class GroupResolver {
  constructor(
    @Inject('GroupAdapterInterface')
    private readonly groupAdapter: GroupAdapterInterface,
  ) {}

  @Mutation(() => GroupResponse, {
    nullable: true,
    description: 'Crear un grupo',
  })
  async createNewGroup(
    @Args('groupDto', { type: () => GroupRequest }) groupDto: GroupRequest,
  ): Promise<GroupResponse> {
    try {
      return await this.groupAdapter.saveGroup(groupDto);
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => GroupResponse, {
    nullable: true,
    description: 'Busca un grupo por su id',
  })
  @UseGuards(ClerkAuthGuard) // Aquí aplicas el guard
  async getGroupById(
    @Args('id', { type: () => String })
    id: string,
    @Context() context: any,
  ): Promise<GroupResponse> {
    try {
      PubliciteAuth.authorize(context);
      return await this.groupAdapter.findGroupById(id);
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => GroupListResponse, {
    nullable: true,
    description: 'Busca un grupo por su nombre',
  })
  async getGroupByName(
    @Args('name', { type: () => String })
    name: string,
    @Args('limit', { type: () => Number, nullable: true }) limit: number,
  ): Promise<GroupListResponse> {
    try {
      return await this.groupAdapter.findGroupByName(name, limit);
    } catch (error: any) {
      throw error;
    }
  }
}
