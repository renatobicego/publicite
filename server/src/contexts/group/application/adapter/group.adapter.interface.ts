import { GroupRequest } from './dto/HTTP-REQUEST/group.request';
import {
  GroupListResponse,
  GroupResponse,
} from './dto/HTTP-RESPONSE/group.response';

export interface GroupAdapterInterface {
  saveGroup(group: GroupRequest): Promise<GroupResponse>;
  findGroupById(id: string): Promise<GroupResponse>;
  findGroupByName(
    name: string,
    limit: number,
    keys?: string[],
  ): Promise<GroupListResponse>;
}
