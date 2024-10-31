import { GroupRequest } from './dto/HTTP-REQUEST/group.request';
import { GroupUpdateRequest } from './dto/HTTP-REQUEST/group.update.request';
import {
  GroupListResponse,
  GroupResponse,
  GroupResponseById,
} from './dto/HTTP-RESPONSE/group.response';

export interface GroupAdapterInterface {
  acceptGroupInvitation(groupId: string, userRequestId: string): Promise<void>;
  addAdminsToGroup(
    admins: string[],
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
    groupId: string,
    member: string,
    creator?: string,
    newCreator?: string,
  ): Promise<any>;
  findGroupById(id: string, userRequest: string): Promise<GroupResponseById>;
  findGroupByNameOrAlias(
    name: string,
    limit: number,
    page: number,
    userRequest: string,
  ): Promise<GroupListResponse>;
  findAllGroupNotifications(
    groupId: string,
    groupAdminOrCreator: string,
    limit: number,
    page: number,
  ): Promise<GroupResponse>;
  isThisGroupExist(alias: string): Promise<Boolean>;
  removeAdminsFromGroupByGroupId(
    admins: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;
  saveGroup(group: GroupRequest, groupCreator: string): Promise<GroupResponse>;
  updateGroupById(group: GroupUpdateRequest): Promise<any>;
}
