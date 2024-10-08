import { GroupRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.request';
import { GroupListResponse, GroupResponse } from '../../application/adapter/dto/HTTP-RESPONSE/group.response';

export interface GroupServiceInterface {
  saveGroup(group: GroupRequest): Promise<GroupResponse>;
  findGroupById(id: string): Promise<GroupResponse>;
  findGroupByName(name: string, limit: number, keys?: string[]): Promise<GroupListResponse>;
}
