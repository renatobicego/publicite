import { GroupUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.update.request';
import {
  GroupResponse,
  GroupResponseById,
} from '../../application/adapter/dto/HTTP-RESPONSE/group.response';
import { Group } from '../entity/group.entity';

export interface GroupRepositoryInterface {
  acceptGroupInvitationAndRemoveUserFromGroupInvitation(groupId: string, userRequestId: string, session?: any): Promise<void>;

  addAdminToGroup(
    newAdmin: string,
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;
  acceptJoinGroupRequestAndRemoveUserFromJoinRequest(
    newMembers: string,
    groupId: string,
    groupAdmin: string,
    session?: any
  ): Promise<any>;
  addMagazinesToGroup(
    magazineIds: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;
  assignNewCreatorAndExitGroupById(
    groupId: string,
    newCreator: string,
    creator: string,
  ): Promise<any>;

  deleteAccount(id: string): Promise<any>;
  deleteMembersFromGroup(
    membersToDelete: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;
  deleteMagazinesFromGroup(
    magazinesToDelete: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;
  deleteGroupById(groupId: string, groupCreator: string): Promise<any>;



  exitMemberOrAdminGroupById(groupId: string, member?: string): Promise<any>;


  findGroupById(id: string, userRequest: string): Promise<GroupResponseById | null>;
  findGroupByNameOrAlias(
    name: string,
    limit: number,
    page: number,
    userRequest: string,
  ): Promise<{
    groups: any[];
    hasMore: boolean;
  }>;



  isThisGroupExist(alias: string, _id?: string): Promise<boolean>;


  save(group: Group): Promise<GroupResponse>;

  pushJoinRequest(
    groupId: string, userId: string, session: any): Promise<any>;
  pushGroupInvitationsAndMakeUserMapNotification(
    notificationId: string,
    groupId: string,
    userId: string,
    session: any,
  ): Promise<any>;
  pullJoinRequest(
    groupId: string, userId: string, session: any): Promise<any>;
  pullGroupInvitations(
    groupId: string,
    userId: string,
    session: any,
  ): Promise<any>;


  removeAdminsFromGroupByGroupId(
    admins: string[],
    groupId: string,
    groupCreator: string,
  ): Promise<any>;



  updateGroupById(group: GroupUpdateRequest, userRequestId: string): Promise<any>;
}
