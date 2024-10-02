import { Inject } from '@nestjs/common';
import { GroupServiceInterface } from '../../domain/service/group.service.interface';
import { GroupRepositoryInterface } from '../../domain/repository/group.repository.interface';
import { GroupResponse } from '../adapter/dto/HTTP-RESPONSE/group.response';
import { GroupRequest } from '../adapter/dto/HTTP-REQUEST/group.request';
import { GroupServiceMapperInterface } from '../../domain/service/mapper/group.service.mapper.interface';

export class GroupService implements GroupServiceInterface {
  constructor(
    @Inject('GroupRepositoryInterface')
    private readonly groupRepository: GroupRepositoryInterface,
    @Inject('GroupServiceMapperInterface')
    private readonly groupMapper: GroupServiceMapperInterface,
  ) {}
  async saveGroup(group: GroupRequest): Promise<GroupResponse> {
    try {
      const groupMapped = this.groupMapper.toEntity(group);
      return await this.groupRepository.save(groupMapped);
    } catch (err) {
      throw err;
    }
  }
}
