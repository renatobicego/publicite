import { GroupRequest } from '../../../application/adapter/dto/HTTP-REQUEST/group.request';
import { GroupResponse } from '../../../application/adapter/dto/HTTP-RESPONSE/group.response';
import { Group } from '../../entity/group.entity';

export interface GroupServiceMapperInterface {
  toEntity(group: GroupRequest, groupCreator: string): Group;
  toGroupResponse(group: any): GroupResponse;
}
