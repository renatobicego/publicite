import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Group } from '../../domain/entity/group.entity';
import { GroupRepositoryInterface } from '../../domain/repository/group.repository.interface';
import { GroupDocument } from '../schemas/group.schema';
import { Inject } from '@nestjs/common';
import { GroupRepositoryMapperInterface } from '../../domain/repository/mapper/group.repository.mapper.interface';
import { GroupResponse } from '../../application/adapter/dto/HTTP-RESPONSE/group.response';

export class GroupRepository implements GroupRepositoryInterface {
  constructor(
    @InjectModel('Group') private readonly groupModel: Model<GroupDocument>,
    @Inject('GroupRepositoryMapperInterface')
    private readonly groupMapper: GroupRepositoryMapperInterface,
  ) {}
  async save(group: Group): Promise<GroupResponse> {
    try {
      const newGroup = new this.groupModel(group);
      const groupSaved = await newGroup.save();
      return this.groupMapper.toGroupResponse(groupSaved);
    } catch (error: any) {
      throw error;
    }
  }
}
