import { GroupUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.update.request';
import {
  GroupListResponse,
  GroupResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/group.response';
import { Group } from '../entity/group.entity';

export interface GroupRepositoryInterface {
  acceptGroupInvitation(groupId: string, userRequestId: string): Promise<void>;

  addAdminsToGroup(
    admins: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;
  addMembersToGroup(
    newMembers: string[],
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
    magazinesToDelete: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;

  deleteGroupById(groupId: string, groupCreator: string): Promise<any>;

  findGroupById(id: string): Promise<GroupResponse>;
  findGroupByNameOrAlias(
    name: string,
    limit: number,
    page: number,
    userRequest: string,
  ): Promise<GroupListResponse>;
  isThisGroupExist(alias: string): Promise<Boolean>;
  save(group: Group): Promise<GroupResponse>;

  pushJoinRequest(groupId: string, userId: string, session: any): Promise<any>;
  pushGroupInvitations(
    groupId: string,
    userId: string,
    session: any,
  ): Promise<any>;
  pullJoinRequest(groupId: string, userId: string, session: any): Promise<any>;
  pullGroupInvitations(
    groupId: string,
    userId: string,
    session: any,
  ): Promise<any>;
  removeAdminsFromGroupByGroupId(
    admins: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any>;

  updateGroupById(group: GroupUpdateRequest): Promise<any>;
}
