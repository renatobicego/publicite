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
import { GroupUpdateRequest } from '../adapter/dto/HTTP-REQUEST/group.update.request';

export class GroupService implements GroupServiceInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('GroupRepositoryInterface')
    private readonly groupRepository: GroupRepositoryInterface,
    @Inject('GroupServiceMapperInterface')
    private readonly groupMapper: GroupServiceMapperInterface,
  ) {}
  async addMagazinesToGroup(
    magazineIds: string[],
    groupId: string,
  ): Promise<any> {
    try {
      this.logger.log('Adding Magazines to group: ' + groupId);
      return await this.groupRepository.addMagazinesToGroup(
        magazineIds,
        groupId,
      );
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred when adding magazines to group: ',
      );
      throw error;
    }
  }

  async addMembersToGroup(newMembers: string[], groupId: string): Promise<any> {
    try {
      this.logger.log('Adding users to group: ' + groupId);
      return await this.groupRepository.addMembersToGroup(newMembers, groupId);
    } catch (error: any) {
      this.logger.error('An error was ocurred when adding admins to group: ');
      throw error;
    }
  }

  async addAdminsToGroup(admins: string[], groupId: string): Promise<any> {
    try {
      this.logger.log('Adding admins to group: ' + admins);
      return await this.groupRepository.addAdminsToGroup(admins, groupId);
    } catch (error: any) {
      this.logger.error('An error was ocurred when adding admins to group: ');
      throw error;
    }
  }
  async deleteAdminsToGroup(admins: string[], groupId: string): Promise<any> {
    try {
      this.logger.log('Deleting admins to group: ' + admins);
      return await this.groupRepository.deleteAdminsToGroup(admins, groupId);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteMembersToGroup(
    membersToDelete: string[],
    groupId: string,
  ): Promise<any> {
    try {
      this.logger.log('Deleting users to group: ' + groupId);
      return await this.groupRepository.deleteMembersToGroup(
        membersToDelete,
        groupId,
      );
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred when deleting admins to group: ' + groupId,
      );
      throw error;
    }
  }

  async deleteMagazinesFromGroup(
    magazineIds: string[],
    groupId: string,
  ): Promise<any> {
    try {
      this.logger.log('Deleting magazines to group: ' + groupId);
      return await this.groupRepository.deleteMagazinesFromGroup(
        magazineIds,
        groupId,
      );
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred when deleting magazines to group: ' + groupId,
      );
      throw error;
    }
  }

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
    page: number,
  ): Promise<GroupListResponse> {
    try {
      this.logger.log('Finding group by name: ' + name);
      if (page <= 0) page = 1;
      return await this.groupRepository.findGroupByName(name, limit, page);
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

  async updateGroupById(group: GroupUpdateRequest): Promise<any> {
    try {
      this.logger.log('Updating group by id: ' + group._id);
      return await this.groupRepository.updateGroupById(group);
    } catch (error: any) {
      this.logger.error('An error was ocurred when updating group: ');
      throw error;
    }
  }
}
