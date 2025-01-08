import { BadRequestException, Inject } from '@nestjs/common';
import { GroupServiceInterface } from '../../domain/service/group.service.interface';
import { GroupRepositoryInterface } from '../../domain/repository/group.repository.interface';

import {
  GroupListResponse,
  GroupResponse,
  GroupResponseById,
} from '../adapter/dto/HTTP-RESPONSE/group.response';
import { GroupRequest } from '../adapter/dto/HTTP-REQUEST/group.request';
import { GroupServiceMapperInterface } from '../../domain/service/mapper/group.service.mapper.interface';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { GroupUpdateRequest } from '../adapter/dto/HTTP-REQUEST/group.update.request';
import { PostsMemberGroupResponse } from '../adapter/dto/HTTP-RESPONSE/group.posts.member.response';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';
import { makeUserRelationMap } from 'src/contexts/module_shared/utils/functions/makeUserRelationMap';
import { UserLocation_group } from '../adapter/dto/HTTP-REQUEST/user.location.request';
import { PostServiceInterface } from 'src/contexts/module_post/post/domain/service/post.service.interface';

interface UserRelation {
  userA: string;
  userB: string;
  typeRelationA: string;
  typeRelationB: string;

}

export class GroupService implements GroupServiceInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('GroupRepositoryInterface')
    private readonly groupRepository: GroupRepositoryInterface,
    @Inject('GroupServiceMapperInterface')
    private readonly groupMapper: GroupServiceMapperInterface,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
    @Inject('PostServiceInterface')
    private readonly postService: PostServiceInterface,

  ) { }


  async acceptGroupInvitation(
    groupId: string,
    userRequestId: string,
  ): Promise<void> {
    try {
      this.logger.log('Accepting group invitation: ' + groupId);
      return await this.groupRepository.acceptGroupInvitationAndRemoveUserFromGroupInvitation(
        groupId,
        userRequestId,
      );
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred when accepting group invitation: ',
      );
      throw error;
    }
  }

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

  async acceptJoinGroupRequest(
    newMember: string,
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      this.logger.log('Adding user to group: ' + groupId);
      return await this.groupRepository.acceptJoinGroupRequestAndRemoveUserFromJoinRequest(
        newMember,
        groupId,
        groupAdmin,
      );
    } catch (error: any) {
      this.logger.error('An error was ocurred when adding admins to group: ');
      throw error;
    }
  }

  async addAdminToGroup(
    newAdmin: string,
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      this.logger.log('Adding admins to group: ' + newAdmin);
      return await this.groupRepository.addAdminToGroup(
        newAdmin,
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

  async deleteGroupById(groupId: string, groupCreator: string): Promise<any> {
    try {
      this.logger.log('Deleting group: ' + groupId);
      await this.groupRepository.deleteGroupById(groupId, groupCreator);
    } catch (error: any) {
      this.logger.error('An error was ocurred when deleting group by id: ');
      throw error;
    }
  }

  async exitGroupById(
    groupId: string,
    member?: string,
    creator?: string,
    newCreator?: string,
  ): Promise<any> {
    try {
      if (creator && newCreator) {
        this.logger.log('Exit group and assign new creator ');
        await this.groupRepository.assignNewCreatorAndExitGroupById(
          groupId,
          newCreator,
          creator,
        );
      } else if (!creator && !newCreator && member) {
        this.logger.log('Exiting group member or admin');
        await this.groupRepository.exitMemberOrAdminGroupById(groupId, member);
      } else {
        throw new Error('Invalid Request');
      }
    } catch (error: any) {
      throw error;
    }
  }

  async findGroupById(
    id: string,
    userRequest: string,
  ): Promise<GroupResponseById | null> {
    try {
      this.logger.log('Finding group by id: ' + id);
      return await this.groupRepository.findGroupById(id, userRequest);
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

      const groupList = await this.groupRepository.findGroupByNameOrAlias(
        name,
        limit,
        page,
        userRequest,
      );

      const respose = groupList.groups.map((group) => {
        let isMember = false;
        let hasJoinRequest = false;
        let hasGroupRequest = false;

        if (
          group.members
            .map((member: any) => member._id.toString())
            .includes(userRequest) ||
          group.admins
            .map((admin: any) => admin._id.toString())
            .includes(userRequest) ||
          group.creator.toString() === userRequest
        ) {
          isMember = true;
        } else if (
          group.groupNotificationsRequest &&
          group.groupNotificationsRequest.joinRequests &&
          group.groupNotificationsRequest.joinRequests
            .map((id: any) => id.toString())
            .includes(userRequest)
        ) {
          hasJoinRequest = true;
        } else if (
          group.groupNotificationsRequest &&
          group.groupNotificationsRequest.groupInvitations &&
          group.groupNotificationsRequest.groupInvitations
            .map((id: any) => id.toString())
            .includes(userRequest)
        ) {
          hasGroupRequest = true;
        }


        group.groupNotificationsRequest = group.groupNotificationsRequest || {};


        group.groupNotificationsRequest.groupInvitations = [
          'You cant access here from this route',
        ];
        group.groupNotificationsRequest.joinRequests = [
          'You cant access here from this route',
        ];

        return {
          group: this.groupMapper.toGroupResponse(group),
          isMember: isMember,
          hasJoinRequest: hasJoinRequest,
          hasGroupRequest: hasGroupRequest,
        };
      });

      groupList.groups = respose;

      return groupList;
    } catch (error: any) {
      throw error;
    }
  }

  async findAllPostsOfGroupMembers(groupId: string, userRequest: string, userLocation:UserLocation_group, idsMembersArray: String [],limit: number, page: number): Promise<PostsMemberGroupResponse | null> {
    try {
      this.logger.log('Finding posts of members of group by id: ' + groupId);
      let conditions;


      const userRelationDocument: UserRelation[] = await this.userService.getRelationsFromUserByUserId(userRequest)
      const userRelationMap : Map<string, String[]> = makeUserRelationMap(userRelationDocument,userRequest)
      let userRelationMapOfGroupMembers: Map<string, String[]> = new Map<string, String[]>()
      
      //ver si es mejor usar un filter
      idsMembersArray.forEach((memberId: string) => {
        if (userRelationMap.get(memberId) && (userRelationMap.get(memberId) != undefined ) ) {
            userRelationMapOfGroupMembers.set(memberId,userRelationMap.get(memberId)!!)
        }
      })

      if(userRelationMapOfGroupMembers.size > 0 )
       conditions = Array.from(userRelationMapOfGroupMembers.entries()).map(([key, value]) => ({
        author: key,
         'visibility.post': { $in: value }, 
        
      }));

      
      return await this.postService.findPostOfGroupMembers(idsMembersArray,conditions)

      return await this.groupRepository.findAllPostsOfGroupMembers(groupId, userRequest,conditions, limit, page);
    } catch (error: any) {
      throw error;
    }
  }


  async isThisGroupExist(alias: string, _id?: string): Promise<boolean> {
    const aliasWithOutSpaces = alias.replace(/\s+/g, '').toLowerCase();
    try {
      this.logger.log('Finding group by alias: ' + alias);
      return await this.groupRepository.isThisGroupExist(aliasWithOutSpaces, _id);
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
      this.logger.log('Deleting admins to group: ' + admins);
      return await this.groupRepository.removeAdminsFromGroupByGroupId(
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
      this.logger.log('creating group: ' + group.name);
      const groupMapped = this.groupMapper.toEntity(group, groupCreator);
      return await this.groupRepository.save(groupMapped);
    } catch (err) {
      throw err;
    }
  }

  async handleNotificationGroupAndSendToGroup(
    groupId: string,
    backData: any,
    event: string,
    session: any,
    notificationId?: string,
  ): Promise<any> {
    this.logger.log('Pushing notification to group - event recieved: ' + event);
    const { userIdTo, userIdFrom } = backData;

    const eventHandlers = new Map<string, () => Promise<any>>([
      [
        'notification_group_new_user_invited',
        async () =>
          await this.groupRepository.pushGroupInvitationsAndMakeUserMapNotification(
            notificationId ?? 'Please check, NOTIFICATION ID IN  handleNotificationGroupAndSendToGroup NOT PROVIDED',
            groupId,
            userIdTo,
            session,
          ),
      ],
      [
        'notification_group_new_user_added',
        async () =>
          await this.groupRepository.acceptGroupInvitationAndRemoveUserFromGroupInvitation(
            groupId,
            userIdFrom,
            session,
          ),
      ],
      [
        'notification_group_user_rejected_group_invitation',
        async () =>
          await this.groupRepository.pullGroupInvitations(
            groupId,
            userIdFrom,
            session,
          ),
      ],
      [
        'notification_group_user_accepted',
        async () => { return }

      ],
      [
        'notification_group_user_rejected',
        async () =>
          await this.groupRepository.pullJoinRequest(
            groupId,
            userIdTo,
            session,
          ),
      ],
      [
        'notification_group_user_request_group_invitation',
        async () =>
          await this.groupRepository.pushJoinRequest(
            groupId,
            userIdFrom,
            session,
          ),
      ],
    ]);

    try {
      this.logger.log(`Handling event: ${event}`);
      const handler = eventHandlers.get(event);
      console.log(handler?.toString());

      if (!handler) {
        throw new Error(`Event type ${event} is not supported`);
      }
      await handler();
    } catch (error: any) {
      this.logger.error(`Error handling event ${event}:`, error);
      throw error;
    }


  }



  async updateGroupById(group: GroupUpdateRequest, userRequestId: string): Promise<any> {
    try {
      this.logger.log('Updating group by id: ' + group._id);
      if (group.alias != undefined && group.alias != null) {
        this.logger.log('Verify if this group exist: ' + group.alias);
        if (group.alias.length < 1) {
          throw new BadRequestException('Alias is not valid');
        }
        const isThisGroupExist = await this.isThisGroupExist(group.alias, group._id);
        if (isThisGroupExist) {
          throw new BadRequestException('Alias already exist');
        }
      }
      return await this.groupRepository.updateGroupById(group, userRequestId);
    } catch (error: any) {
      this.logger.error('An error was ocurred when updating group: ');
      throw error;
    }
  }
}


