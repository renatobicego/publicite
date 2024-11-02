import { GroupRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.request';
import { GroupUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.update.request';
import {
  GroupListResponse,
  GroupResponse,
  GroupResponseById,
} from '../../application/adapter/dto/HTTP-RESPONSE/group.response';

export interface GroupServiceInterface {
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
  isThisGroupExist(alias: string): Promise<boolean>;
  saveGroup(group: GroupRequest, groupCreator: string): Promise<GroupResponse>;
  pushNotificationToGroup(
    groupId: string,
    backData: any,
    event: string,
    session: any,
  ): Promise<any>;
  removeAdminsFromGroupByGroupId(
    admins: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;
  updateGroupById(group: GroupUpdateRequest): Promise<any>;
}
