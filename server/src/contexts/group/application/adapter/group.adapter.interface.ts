import { GroupRequest } from './dto/HTTP-REQUEST/group.request';
import { GroupUpdateRequest } from './dto/HTTP-REQUEST/group.update.request';
import {
  GroupListResponse,
  GroupResponse,
} from './dto/HTTP-RESPONSE/group.response';

export interface GroupAdapterInterface {
  findGroupById(id: string): Promise<GroupResponse>;
  findGroupByName(
    name: string,
    limit: number,
    keys?: string[],
  ): Promise<GroupListResponse>;
  saveGroup(group: GroupRequest): Promise<GroupResponse>;
  updateGroupById(group: GroupUpdateRequest): Promise<any>;
}
