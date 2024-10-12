import { GroupRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.request';
import { GroupUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.update.request';
import {
  GroupListResponse,
  GroupResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/group.response';

export interface GroupServiceInterface {
  findGroupById(id: string): Promise<GroupResponse>;
  findGroupByName(
    name: string,
    limit: number,
    keys?: string[],
  ): Promise<GroupListResponse>;
  saveGroup(group: GroupRequest): Promise<GroupResponse>;
  updateGroupById(group: GroupUpdateRequest): Promise<any>;
}
