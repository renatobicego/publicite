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

const eventTypes = [
  'notification_group_new_user_invited', // Te han invitado a un grupo -> 0
  'notification_group_new_user_added', // Te han agregado a un grupo -> 1
  'notification_group_user_accepted', // te han aceptado en un grupo -> 2
  'notification_group_user_rejected', // te han rechazado en un grupo -> 3
  'notification_group_user_rejected_group_invitation', // usuario B rechazo unirse al grupo -> 4
  'notification_group_user_request_group_invitation', // Usuario A quiere pertenecer a grupo -> 5
] as const;

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
    groupAdmin: string,
  ): Promise<any> {
    try {
      this.logger.log('Adding Magazines to group: ' + groupId);
      return await this.groupRepository.addMagazinesToGroup(
        magazineIds,
        groupId,
        groupAdmin,
      );
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred when adding magazines to group: ',
      );
      throw error;
    }
  }

  async addMembersToGroup(
    newMembers: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      this.logger.log('Adding users to group: ' + groupId);
      return await this.groupRepository.addMembersToGroup(
        newMembers,
        groupId,
        groupAdmin,
      );
    } catch (error: any) {
      this.logger.error('An error was ocurred when adding admins to group: ');
      throw error;
    }
  }

  async addAdminsToGroup(
    admins: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      this.logger.log('Adding admins to group: ' + admins);
      return await this.groupRepository.addAdminsToGroup(
        admins,
        groupId,
        groupAdmin,
      );
    } catch (error: any) {
      this.logger.error('An error was ocurred when adding admins to group: ');
      throw error;
    }
  }

  async deleteMembersFromGroup(
    membersToDelete: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      this.logger.log('Deleting users to group: ' + groupId);
      return await this.groupRepository.deleteMembersFromGroup(
        membersToDelete,
        groupId,
        groupAdmin,
      );
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred when deleting members to group: ' + groupId,
      );
      throw error;
    }
  }

  async deleteMagazinesFromGroup(
    magazineIds: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      this.logger.log('Deleting magazines to group: ' + groupId);
      return await this.groupRepository.deleteMagazinesFromGroup(
        magazineIds,
        groupId,
        groupAdmin,
      );
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred when deleting magazines to group: ' + groupId,
      );
      throw error;
    }
  }

  async deleteGroupById(groupId: string, groupAdmin: string): Promise<any> {
    try {
      this.logger.log('Deleting group: ' + groupId);
      await this.groupRepository.deleteGroupById(groupId, groupAdmin);
    } catch (error: any) {
      this.logger.error('An error was ocurred when deleting group by id: ');
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
  async findGroupByNameOrAlias(
    name: string,
    limit: number,
    page: number,
    userRequest: string,
  ): Promise<GroupListResponse> {
    try {
      this.logger.log('Finding group by name: ' + name);
      if (page <= 0) page = 1;
      return await this.groupRepository.findGroupByNameOrAlias(
        name,
        limit,
        page,
        userRequest,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async isThisGroupExist(alias: string): Promise<Boolean> {
    const aliasWithOutSpaces = alias.replace(/\s+/g, '').toLowerCase();
    try {
      this.logger.log('Finding group by alias: ' + alias);
      return await this.groupRepository.isThisGroupExist(aliasWithOutSpaces);
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
      this.logger.log('Deleting admins to group: ' + admins);
      return await this.groupRepository.removeAdminsFromGroupByGroupId(
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
      this.logger.log('creating group: ' + group.name);
      const groupMapped = this.groupMapper.toEntity(group, groupCreator);
      return await this.groupRepository.save(groupMapped);
    } catch (err) {
      throw err;
    }
  }

  async pushNotificationToGroup(
    groupId: string,
    userId: string,
    event: string,
    session: any,
  ): Promise<any> {
    this.logger.log('Pushing notification to group - event recieved: ' + event);
    try {
      switch (event) {
        case eventTypes[0]: // Te han invitado a un grupo -> 0
          this.logger.log('Pushing join request to group: ' + groupId);
          await this.groupRepository.pushGroupInvitations(
            groupId,
            userId,
            session,
          );
          break;

        case eventTypes[1]:
        case eventTypes[4]: // Te han agregado a un grupo -> 1 | usuario B rechazo unirse al grupo -> 4
          await this.groupRepository.pullGroupInvitations(
            groupId,
            userId,
            session,
          );
          break;

        case eventTypes[2]:
        case eventTypes[3]: // te han aceptado en un grupo -> 2 | te han rechazado en un grupo -> 3
          await this.groupRepository.pullJoinRequest(groupId, userId, session);
          break;

        case eventTypes[5]: // Usuario A quiere pertenecer a grupo -> 5
          this.logger.log('Pushing join request to group: ' + groupId);
          await this.groupRepository.pushJoinRequest(groupId, userId, session);
          break;

        default:
          throw new Error(`Event type ${event} is not supported`);
      }
    } catch (error: any) {
      throw error;
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
