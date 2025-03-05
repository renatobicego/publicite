import { PostsMemberGroupResponse } from 'src/contexts/module_shared/sharedGraphql/group.posts.member.response';
import { GroupRequest } from './dto/HTTP-REQUEST/group.request';
import { GroupUpdateRequest } from './dto/HTTP-REQUEST/group.update.request';
import { UserLocation_group } from './dto/HTTP-REQUEST/user.location.request';

import {
  GroupListResponse,
  GroupResponse,
  GroupResponseById,
} from './dto/HTTP-RESPONSE/group.response';
import { GroupExitRequest } from './dto/HTTP-REQUEST/group.exit.request';

export interface GroupAdapterInterface {
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

  deleteMembersToGroup(
    membersToDelete: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;
  deleteMagazinesFromGroup(
    magazinesToDelete: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;
  deleteGroupById(groupId: string, groupAdmin: string): Promise<any>;
  exitGroupById(
    groupExitRequest: GroupExitRequest,
  ): Promise<any>;
  findGroupById(id: string, userRequest: string): Promise<GroupResponseById | null>;
  findGroupByNameOrAlias(
    name: string,
    limit: number,
    page: number,
    userRequest: string,
  ): Promise<GroupListResponse>;

  findAllPostsOfGroupMembers(groupId: string, userRequest: string, userLocation: UserLocation_group, idsMembersArray: String[], limit: number, page: number): Promise<PostsMemberGroupResponse | null>;
  isThisGroupExist(alias: string): Promise<boolean>;
  removeAdminsFromGroupByGroupId(
    admins: string[],
    groupId: string,
    groupCreator: string,
  ): Promise<any>;
  saveGroup(group: GroupRequest, groupCreator: string): Promise<GroupResponse>;
  updateGroupById(group: GroupUpdateRequest, userRequestId: string): Promise<any>;
}
