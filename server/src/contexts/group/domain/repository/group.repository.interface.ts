import { GroupResponse } from '../../application/adapter/dto/HTTP-RESPONSE/group.response';
import { Group } from '../entity/group.entity';

export interface GroupRepositoryInterface {
  save(group: Group): Promise<GroupResponse>;
}
