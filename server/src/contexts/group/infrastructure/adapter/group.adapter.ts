import { Inject } from '@nestjs/common';

import { GroupAdapterInterface } from '../../application/adapter/group.adapter.interface';
import { GroupServiceInterface } from '../../domain/service/group.service.interface';
import {
  GroupListResponse,
  GroupResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/group.response';
import { GroupRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.request';
import { GroupUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.update.request';

export class GroupAdapter implements GroupAdapterInterface {
  constructor(
    @Inject('GroupServiceInterface')
    private readonly groupService: GroupServiceInterface,
  ) {}
  async addMagazinesToGroup(
    magazineIds: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      await this.groupService.addMagazinesToGroup(
        magazineIds,
        groupId,
        groupAdmin,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async addMembersToGroup(
    newMembers: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      await this.groupService.addMembersToGroup(
        newMembers,
        groupId,
        groupAdmin,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async addAdminsToGroup(
    admins: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      await this.groupService.addAdminsToGroup(admins, groupId, groupAdmin);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteMembersToGroup(
    membersToDelete: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      await this.groupService.deleteMembersFromGroup(
        membersToDelete,
        groupId,
        groupAdmin,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async deleteMagazinesFromGroup(
    magazinesToDelete: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      await this.groupService.deleteMagazinesFromGroup(
        magazinesToDelete,
        groupId,
        groupAdmin,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async deleteGroupById(groupId: string, groupAdmin: string): Promise<any> {
    try {
      await this.groupService.deleteGroupById(groupId, groupAdmin);
    } catch (error: any) {
      throw error;
    }
  }

  async findGroupById(id: string): Promise<GroupResponse> {
    try {
      const response = await this.groupService.findGroupById(id);
      return response;
    } catch (error: any) {
      throw error;
    }
  }
  async findGroupByName(
    name: string,
    limit: number,
    page: number,
  ): Promise<GroupListResponse> {
    try {
      const response = await this.groupService.findGroupByName(
        name,
        limit,
        page,
      );
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  async removeAdminsFromGroupByGroupId(
    admins: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      await this.groupService.removeAdminsFromGroupByGroupId(
        admins,
        groupId,
        groupAdmin,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async saveGroup(
    group: GroupRequest,
    groupCreator: string,
  ): Promise<GroupResponse> {
    try {
      return await this.groupService.saveGroup(group, groupCreator);
    } catch (error: any) {
      throw error;
    }
  }

  async updateGroupById(group: GroupUpdateRequest): Promise<any> {
    try {
      return await this.groupService.updateGroupById(group);
    } catch (error: any) {
      throw error;
    }
  }
}
