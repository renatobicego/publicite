import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Info } from '@nestjs/graphql';

import { GroupRequest } from 'src/contexts/group/application/adapter/dto/HTTP-REQUEST/group.request';
import {
  GroupListResponse,
  GroupResponse,
} from 'src/contexts/group/application/adapter/dto/HTTP-RESPONSE/group.response';
import { GroupAdapterInterface } from 'src/contexts/group/application/adapter/group.adapter.interface';

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
  async getGroupById(
    @Args('id', { type: () => String })
    id: string,
  ): Promise<GroupResponse> {
    try {
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
    @Info() info: any,
  ): Promise<GroupListResponse> {
    try {
      const keys = info.fieldNodes[0].selectionSet.selections
        .find((selection: any) => selection.name.value === 'groups')
        .selectionSet.selections.map((item: any) => item.name.value);
        
      return await this.groupAdapter.findGroupByName(name, limit, keys);
    } catch (error: any) {
      throw error;
    }
  }
}
