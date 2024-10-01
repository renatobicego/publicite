import { GroupRequest } from 'src/contexts/group/application/adapter/dto/HTTP-REQUEST/group.request';
import { Group } from '../../entity/group.entity';

export interface GroupServiceMapperInterface {
  toEntity(group: GroupRequest): Group;
}
