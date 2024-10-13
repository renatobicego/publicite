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
  async addAdminsToGroup(admins: string[], groupId: string): Promise<any> {
    try {
      await this.groupService.addAdminsToGroup(admins, groupId);
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
  ): Promise<GroupListResponse> {
    try {
      const response = await this.groupService.findGroupByName(name, limit);
      return response;
    } catch (error: any) {
      throw error;
    }
  }
  async saveGroup(group: GroupRequest): Promise<GroupResponse> {
    try {
      return await this.groupService.saveGroup(group);
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
