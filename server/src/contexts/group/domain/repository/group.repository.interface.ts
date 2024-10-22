import { GroupUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.update.request';
import {
  GroupListResponse,
  GroupResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/group.response';
import { Group } from '../entity/group.entity';

export interface GroupRepositoryInterface {
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
  deleteAdminsFromGroup(
    admins: string[],
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
  findGroupById(id: string): Promise<GroupResponse>;
  findGroupByName(
    name: string,
    limit: number,
    page: number,
  ): Promise<GroupListResponse>;
  save(group: Group): Promise<GroupResponse>;
  updateGroupById(group: GroupUpdateRequest): Promise<any>;
}
