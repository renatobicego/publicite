import { Inject } from '@nestjs/common';
import { GroupServiceInterface } from '../../domain/service/group.service.interface';
import { GroupRepositoryInterface } from '../../domain/repository/group.repository.interface';

import {
  GroupListResponse,
  GroupResponse,
} from '../adapter/dto/HTTP-RESPONSE/group.response';
import { GroupRequest } from '../adapter/dto/HTTP-REQUEST/group.request';
import { GroupServiceMapperInterface } from '../../domain/service/mapper/group.service.mapper.interface';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';

export class GroupService implements GroupServiceInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('GroupRepositoryInterface')
    private readonly groupRepository: GroupRepositoryInterface,
    @Inject('GroupServiceMapperInterface')
    private readonly groupMapper: GroupServiceMapperInterface,
  ) {}
  async findGroupById(id: string): Promise<GroupResponse> {
    try {
      this.logger.log('Finding group by id: ' + id);
      return await this.groupRepository.findGroupById(id);
    } catch (error: any) {
      throw error;
    }
  }
  async findGroupByName(
    name: string,
    limit: number,
  ): Promise<GroupListResponse> {
    try {
      this.logger.log('Finding group by name: ' + name);
      return await this.groupRepository.findGroupByName(name, limit);
    } catch (error: any) {
      throw error;
    }
  }
  async saveGroup(group: GroupRequest): Promise<GroupResponse> {
    try {
      const groupMapped = this.groupMapper.toEntity(group);
      return await this.groupRepository.save(groupMapped);
    } catch (err) {
      throw err;
    }
  }
}
