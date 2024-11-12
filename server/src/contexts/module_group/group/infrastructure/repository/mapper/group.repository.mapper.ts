import { GroupResponse } from "../../../application/adapter/dto/HTTP-RESPONSE/group.response";
import { GroupRepositoryMapperInterface } from "../../../domain/repository/mapper/group.repository.mapper.interface";

export class GroupRepositoryMapper implements GroupRepositoryMapperInterface {
  toGroupResponse(group: any): GroupResponse {
    return new GroupResponse(group);
  }
}
