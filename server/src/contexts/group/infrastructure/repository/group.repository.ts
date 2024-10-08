import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Group } from '../../domain/entity/group.entity';
import { GroupRepositoryInterface } from '../../domain/repository/group.repository.interface';
import { GroupDocument } from '../schemas/group.schema';
import { Inject } from '@nestjs/common';
import { GroupRepositoryMapperInterface } from '../../domain/repository/mapper/group.repository.mapper.interface';
import {
  GroupListResponse,
  GroupResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/group.response';

export class GroupRepository implements GroupRepositoryInterface {
  constructor(
    @InjectModel('Group') private readonly groupModel: Model<GroupDocument>,
    @Inject('GroupRepositoryMapperInterface')
    private readonly groupMapper: GroupRepositoryMapperInterface,
  ) {}
  async findGroupById(id: string): Promise<GroupResponse> {
    try {
      const group = await this.groupModel.findById(id).lean();
      return this.groupMapper.toGroupResponse(group);
    } catch (error: any) {
      throw error;
    }
  }
  async findGroupByName(
    name: string,
    limit: number,
  ): Promise<GroupListResponse> {
    try {
      const regex = new RegExp(`${name}`, 'i'); // de esta forma buscamos el nombre en TODO EL STRING DE NAME

      // const regex = new RegExp(`^${name}`, 'i'); // de esta forma buscamos el nombre SOLO COMO EMPIEZA, SI EL NAME QUE BUSCA ESTA EN EL MEDIO NO APARECE

      // Realiza la búsqueda con paginación
      const groups = await this.groupModel
        .find({ name: { $regex: regex } })
        .limit(limit + 1)
        .sort({ name: 1 }) //  Ordena los resultados por nombre
        .lean();

      const hasMore = groups.length > limit;
      const groupResponse = groups
        .slice(0, limit)
        .map((group) => this.groupMapper.toGroupResponse(group));
      return {
        groups: groupResponse,
        hasMore: hasMore,
      };
    } catch (error: any) {
      throw error;
    }
  }

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
