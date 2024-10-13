import { GroupUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.update.request';
import {
  GroupListResponse,
  GroupResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/group.response';
import { Group } from '../entity/group.entity';

export interface GroupRepositoryInterface {
  addAdminsToGroup(admins: string[], groupId: string): Promise<any>;
  addMembersToGroup(newMembers: string[], groupId: string): Promise<any>;
  deleteAdminsToGroup(admins: string[], groupId: string): Promise<any>;
  deleteMembersToGroup(membersToDelete: string[], groupId: string): Promise<any>;
  findGroupById(id: string): Promise<GroupResponse>;
  findGroupByName(
    name: string,
    limit: number,
    keys?: string[],
  ): Promise<GroupListResponse>;
  save(group: Group): Promise<GroupResponse>;
  updateGroupById(group: GroupUpdateRequest): Promise<any>;
}
