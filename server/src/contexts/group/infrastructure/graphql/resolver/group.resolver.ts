import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { ClerkAuthGuard } from 'src/contexts/clerk-auth/clerk.auth.guard';

import { GroupRequest } from 'src/contexts/group/application/adapter/dto/HTTP-REQUEST/group.request';
import { GroupUpdateRequest } from 'src/contexts/group/application/adapter/dto/HTTP-REQUEST/group.update.request';
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

  @Mutation(() => String, {
    nullable: true,
    description: 'Agregar admins un grupo',
  })
  async addAdminsToGroupByGroupId(
    @Args('newAdmins', { type: () => [String] })
    newAdmins: string[],
    @Args('groupAdmin', { type: () => String })
    groupAdmin: string,
    @Args('groupId', { type: () => String })
    groupId: string,
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, groupAdmin);
      await this.groupAdapter.addAdminsToGroup(newAdmins, groupId);
      return 'Admins added';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Agregar miembros a  un grupo',
  })
  async addMembersToGroupByGroupId(
    @Args('newMembers', { type: () => [String] })
    newMembers: string[],
    @Args('groupAdmin', { type: () => String })
    groupAdmin: string,
    @Args('groupId', { type: () => String })
    groupId: string,
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, groupAdmin);
      await this.groupAdapter.addMembersToGroup(newMembers, groupId);
      return 'Admins added';
    } catch (error: any) {
      throw error;
    }
  }

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

  @Mutation(() => String, {
    nullable: true,
    description: 'Eliminar admins un grupo',
  })
  async deleteAdminsToGroupByGroupId(
    @Args('adminsToDelete', { type: () => [String] })
    adminsToDelete: string[],
    @Args('groupAdmin', { type: () => String })
    groupAdmin: string,
    @Args('groupId', { type: () => String })
    groupId: string,
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, groupAdmin);
      await this.groupAdapter.deleteAdminsToGroup(adminsToDelete, groupId);
      return 'Users deleted';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Eliminar miembros un grupo',
  })
  async deleteMembersToGroupByGroupId(
    @Args('membersToDelete', { type: () => [String] })
    membersToDelete: string[],
    @Args('groupAdmin', { type: () => String })
    groupAdmin: string,
    @Args('groupId', { type: () => String })
    groupId: string,
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, groupAdmin);
      await this.groupAdapter.deleteMembersToGroup(membersToDelete, groupId);
      return 'Users deleted';
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => GroupResponse, {
    nullable: true,
    description: 'Busca un grupo por su id',
  })
  @UseGuards(ClerkAuthGuard)
  async getGroupById(
    @Args('id', { type: () => String })
    id: string,
    @Context() context: any,
  ): Promise<GroupResponse> {
    try {
      PubliciteAuth.authorize(context, 'not admin');
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

  @Mutation(() => String, {
    nullable: true,
    description: 'Actualizar un grupo',
  })
  async updateGroupById(
    @Args('groupToUpdate', { type: () => GroupUpdateRequest })
    groupToUpdate: GroupUpdateRequest,
    @Context() context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, groupToUpdate.admin);
      return await this.groupAdapter.updateGroupById(groupToUpdate);
    } catch (error: any) {
      throw error;
    }
  }
}
