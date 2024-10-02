import { GroupRequest } from './dto/HTTP-REQUEST/group.request';
import { GroupResponse } from './dto/HTTP-RESPONSE/group.response';

export interface GroupAdapterInterface {
  saveGroup(group: GroupRequest): Promise<GroupResponse>;
}
