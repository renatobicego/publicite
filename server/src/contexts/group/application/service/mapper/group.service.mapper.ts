import { Group } from 'src/contexts/group/domain/entity/group.entity';
import { GroupServiceMapperInterface } from 'src/contexts/group/domain/service/mapper/group.service.mapper.interface';
import { GroupRequest } from '../../adapter/dto/HTTP-REQUEST/group.request';

export class GroupServiceMapper implements GroupServiceMapperInterface {
  toEntity(group: GroupRequest, groupCreator: string): Group {
    const aliasWithOutSpaces = group.alias.replace(/\s+/g, '');
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
    );
  }
}
