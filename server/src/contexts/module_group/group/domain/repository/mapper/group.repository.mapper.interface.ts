import { GroupResponse } from "../../../application/adapter/dto/HTTP-RESPONSE/group.response";


export interface GroupRepositoryMapperInterface {
  toGroupResponse(group: any): GroupResponse;
}
