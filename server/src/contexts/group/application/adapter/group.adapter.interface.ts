import { GroupRequest } from './dto/HTTP-REQUEST/group.request';
import { GroupResponse } from './dto/HTTP-RESPONSE/group.response';

export interface GroupAdapterInterface {
  saveGroup(group: GroupRequest): Promise<GroupResponse>;
  findGroupById(id: string): Promise<GroupResponse>;
  findGroupByName(
    name: string,
    limit: number,
    page: number,
  ): Promise<GroupResponse[]>;
}
