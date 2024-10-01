import { Inject } from '@nestjs/common';
import { GroupAdapterInterface } from '../../application/adapter/group.adapter.interface';
import { GroupServiceInterface } from '../../domain/service/group.service.interface';
import { GroupResponse } from '../../application/adapter/dto/HTTP-RESPONSE/group.response';
import { GroupRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.request';

export class GroupAdapter implements GroupAdapterInterface {
  constructor(
    @Inject('GroupServiceInterface')
    private readonly groupService: GroupServiceInterface,
  ) {}
  async saveGroup(group: GroupRequest): Promise<GroupResponse> {
    try {
      return await this.groupService.saveGroup(group);
    } catch (error: any) {
      throw error;
    }
  }
}
