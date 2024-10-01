import { GroupResponse } from 'src/contexts/group/application/adapter/dto/HTTP-RESPONSE/group.response';

export interface GroupRepositoryMapperInterface {
  toGroupResponse(group: any): GroupResponse;
}
