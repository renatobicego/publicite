import { PostsMemberGroupResponse } from 'src/contexts/module_shared/sharedGraphql/group.posts.member.response';
import { GroupRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.request';
import { GroupUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.update.request';
import { UserLocation_group } from '../../application/adapter/dto/HTTP-REQUEST/user.location.request';

import {
  GroupListResponse,
  GroupResponse,
  GroupResponseById,
} from '../../application/adapter/dto/HTTP-RESPONSE/group.response';
import { GroupExitRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.exit.request';

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
    groupExitRequest: GroupExitRequest,
  ): Promise<any>;

  findGroupById(id: string, userRequest: string): Promise<GroupResponseById | null>;
  findAllPostsOfGroupMembers(groupId: string, userRequest: string, userLocation: UserLocation_group, idsMembersArray: String[], limit: number, page: number): Promise<PostsMemberGroupResponse | null>;

  findGroupByNameOrAlias(
    name: string,
    limit: number,
    page: number,
    userRequest: string,
  ): Promise<GroupListResponse>;
  isThisGroupExist(alias: string): Promise<boolean>;
  saveGroup(group: GroupRequest, groupCreator: string): Promise<GroupResponse>;

  handleNotificationGroupAndSendToGroup(
    groupId: string,
    backData: any,
    event: string,
    session: any,
    notificationId?: string,
  ): Promise<any>;
  removeAdminsFromGroupByGroupId(
    admins: string[],
    groupId: string,
    groupCreator: string,
  ): Promise<any>;
  updateGroupById(group: GroupUpdateRequest, userRequestId: string): Promise<any>;
}
