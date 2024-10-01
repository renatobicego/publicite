import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GroupRequest } from 'src/contexts/group/application/adapter/dto/HTTP-REQUEST/group.request';
import { GroupResponse } from 'src/contexts/group/application/adapter/dto/HTTP-RESPONSE/group.response';
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
}
