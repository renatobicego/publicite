import { GroupRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.request';
import { GroupResponse } from '../../application/adapter/dto/HTTP-RESPONSE/group.response';

export interface GroupServiceInterface {
  saveGroup(group: GroupRequest): Promise<GroupResponse>;
}
