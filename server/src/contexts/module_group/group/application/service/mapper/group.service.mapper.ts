import { Group } from '../../../domain/entity/group.entity';
import { GroupServiceMapperInterface } from '../../../domain/service/mapper/group.service.mapper.interface';
import { GroupRequest } from '../../adapter/dto/HTTP-REQUEST/group.request';
import { GroupResponse } from '../../adapter/dto/HTTP-RESPONSE/group.response';

export class GroupServiceMapper implements GroupServiceMapperInterface {
  toGroupResponse(group: any): GroupResponse {
    return new GroupResponse(group);
  }
  toEntity(group: GroupRequest, groupCreator: string): Group {
    const aliasWithOutSpaces = group.alias.replace(/\s+/g, '').toLowerCase();
    let groupNotificationsRequest: {
      joinRequests: string[];
      groupInvitations: string[];
    } = {
      joinRequests: [],
      groupInvitations: [],
    };

    return new Group(
      group.members,
      group.admins,
      group.name,
      aliasWithOutSpaces,
      groupCreator,
      group.rules,
      group.magazines,
      group.details,
      group.profilePhotoUrl,
      group.visibility,
      groupNotificationsRequest,
    );
  }
}
