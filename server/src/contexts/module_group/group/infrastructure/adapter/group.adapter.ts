import { Inject } from '@nestjs/common';

import { GroupAdapterInterface } from '../../application/adapter/group.adapter.interface';
import { GroupServiceInterface } from '../../domain/service/group.service.interface';
import {
  GroupListResponse,
  GroupResponse,
  GroupResponseById,
} from '../../application/adapter/dto/HTTP-RESPONSE/group.response';
import { GroupRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.request';
import { GroupUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.update.request';

import { UserLocation_group } from '../../application/adapter/dto/HTTP-REQUEST/user.location.request';
import { PostsMemberGroupResponse } from 'src/contexts/module_shared/sharedGraphql/group.posts.member.response';
import { GroupExitRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.exit.request';

export class GroupAdapter implements GroupAdapterInterface {
  constructor(
    @Inject('GroupServiceInterface')
    private readonly groupService: GroupServiceInterface,
  ) { }

  async acceptGroupInvitation(
    groupId: string,
    userRequestId: string,
  ): Promise<void> {
    try {
      await this.groupService.acceptGroupInvitation(groupId, userRequestId);
    } catch (error: any) {
      throw error;
    }
  }

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

  async acceptJoinGroupRequest(
    newMember: string,
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      await this.groupService.acceptJoinGroupRequest(
        newMember,
        groupId,
        groupAdmin,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async addAdminToGroup(
    newAdmin: string,
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      await this.groupService.addAdminToGroup(newAdmin, groupId, groupAdmin);
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

  async deleteAccount(id: string): Promise<any> {
    try {
      await this.groupService.deleteAccount(id);
    } catch (error: any){
      throw error;
    }
  }


  async deleteGroupById(groupId: string, groupCreator: string): Promise<any> {
    try {
      await this.groupService.deleteGroupById(groupId, groupCreator);
    } catch (error: any) {
      throw error;
    }
  }

  async exitGroupById(
    groupExitRequest: GroupExitRequest,
  ): Promise<any> {
    try {
      await this.groupService.exitGroupById(
        groupExitRequest
      );
    } catch (error: any) {
      throw error;
    }
  }

  async findGroupById(
    id: string,
    userRequest: string,
  ): Promise<GroupResponseById | null> {
    try {
      const response = await this.groupService.findGroupById(id, userRequest);
      return response;
    } catch (error: any) {
      throw error;
    }
  }
  async findGroupByNameOrAlias(
    name: string,
    limit: number,
    page: number,
    userRequest: string,
  ): Promise<GroupListResponse> {
    try {
      const response = await this.groupService.findGroupByNameOrAlias(
        name,
        limit,
        page,
        userRequest,
      );
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  async findAllPostsOfGroupMembers(groupId: string, userRequest: string, userLocation: UserLocation_group, idsMembersArray: String[], limit: number, page: number): Promise<PostsMemberGroupResponse | null> {
    try {
      return await this.groupService.findAllPostsOfGroupMembers(groupId, userRequest, userLocation, idsMembersArray, limit, page);
    } catch (error: any) {
      throw error;
    }
  }
  async isThisGroupExist(alias: string): Promise<boolean> {
    try {
      return await this.groupService.isThisGroupExist(alias);
    } catch (error: any) {
      throw error;
    }
  }
  async removeAdminsFromGroupByGroupId(
    admins: string[],
    groupId: string,
    groupCreator: string,
  ): Promise<any> {
    try {
      await this.groupService.removeAdminsFromGroupByGroupId(
        admins,
        groupId,
        groupCreator,
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

  async updateGroupById(group: GroupUpdateRequest, userRequestId: string): Promise<any> {
    try {
      return await this.groupService.updateGroupById(group, userRequestId);
    } catch (error: any) {
      throw error;
    }
  }
}
