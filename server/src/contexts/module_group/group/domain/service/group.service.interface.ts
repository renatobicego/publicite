import { GroupRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.request';
import { GroupUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.update.request';
import { PostsMemberGroupResponse } from '../../application/adapter/dto/HTTP-RESPONSE/group.posts.member.response';
import {
  GroupListResponse,
  GroupResponse,
  GroupResponseById,
} from '../../application/adapter/dto/HTTP-RESPONSE/group.response';

export interface GroupServiceInterface {
  acceptGroupInvitation(groupId: string, userRequestId: string): Promise<void>;

  addAdminToGroup(
    newAdmin: string,
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;
  acceptJoinGroupRequest(
    newMember: string,
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;
  addMagazinesToGroup(
    magazineIds: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;
  deleteMembersFromGroup(
    membersToDelete: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;

  deleteMagazinesFromGroup(
    magazineIds: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;
  deleteGroupById(groupId: string, groupAdmin: string): Promise<any>;
  exitGroupById(
    groupId: string,
    member?: string,
    creator?: string,
    newCreator?: string,
  ): Promise<any>;

  findGroupById(id: string, userRequest: string): Promise<GroupResponseById | null>;
  findAllPostsOfGroupMembers(groupId: string, userRequest: string, limit: number, page: number): Promise<PostsMemberGroupResponse | null>;

  findGroupByNameOrAlias(
    name: string,
    limit: number,
    page: number,
    userRequest: string,
  ): Promise<GroupListResponse>;
  isThisGroupExist(alias: string): Promise<boolean>;
  saveGroup(group: GroupRequest, groupCreator: string): Promise<GroupResponse>;

  handleNotificationGroupAndSendToGroup(
    notificationId: string,
    groupId: string,
    backData: any,
    event: string,
    session: any,
  ): Promise<any>;
  removeAdminsFromGroupByGroupId(
    admins: string[],
    groupId: string,
    groupCreator: string,
  ): Promise<any>;
  updateGroupById(group: GroupUpdateRequest): Promise<any>;
}
