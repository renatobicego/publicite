import { GroupRequest } from '../../../application/adapter/dto/HTTP-REQUEST/group.request';
import { Group } from '../../entity/group.entity';

export interface GroupServiceMapperInterface {
  toEntity(group: GroupRequest, groupCreator: string): Group;
}
