import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Inject } from '@nestjs/common';

import { Group } from '../../domain/entity/group.entity';
import { GroupRepositoryInterface } from '../../domain/repository/group.repository.interface';
import { GroupDocument } from '../schemas/group.schema';
import { GroupRepositoryMapperInterface } from '../../domain/repository/mapper/group.repository.mapper.interface';
import {
  GroupListResponse,
  GroupResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/group.response';
import { GroupUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.update.request';
import { IUser } from 'src/contexts/user/infrastructure/schemas/user.schema';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';

export class GroupRepository implements GroupRepositoryInterface {
  constructor(
    @InjectModel('Group') private readonly groupModel: Model<GroupDocument>,
    @InjectModel('User') private readonly userModel: Model<IUser>,
    @Inject('GroupRepositoryMapperInterface')
    private readonly groupMapper: GroupRepositoryMapperInterface,
    @InjectConnection() private readonly connection: Connection,
    private readonly logger: MyLoggerService,
  ) {}
  async addMembersToGroup(members: string[], groupId: string): Promise<any> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        //Enfoque FOR
        for (const member of members) {
          await this.groupModel.findByIdAndUpdate(
            groupId,
            { $addToSet: { members: member } },
            { session },
          );
          await this.userModel.findByIdAndUpdate(
            member,
            { $addToSet: { groups: groupId } },
            { session },
          );
        }
      });
      await session.commitTransaction();
      this.logger.log(
        'Members added to group successfully Group ID: ' + groupId,
      );
      return;
    } catch (error: any) {
      await session.abortTransaction();
      this.logger.error(
        'An error was ocurred when adding Members to group: ' + error,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

  async addAdminsToGroup(admins: string[], groupId: string): Promise<any> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        //Enfoque FOR
        for (const admin of admins) {
          await this.groupModel.findByIdAndUpdate(
            groupId,
            { $addToSet: { admins: admin } },
            { session },
          );
          await this.userModel.findByIdAndUpdate(
            admin,
            { $addToSet: { groups: groupId } },
            { session },
          );
        }
        //ENFOQUE MAP
        // await session.withTransaction(async () => {
        //   const promises = admins.map(async (admin) => {
        //     const groupPromise = this.groupModel.findByIdAndUpdate(
        //       groupId,
        //       {
        //         $push: {
        //           admins: admin,
        //         },
        //       },
        //       { session },
        //     );
        //     const adminPromise = this.userModel.findByIdAndUpdate(
        //       admin,
        //       {
        //         $push: {
        //           groups: groupId,
        //         },
        //       },
        //       { session },
        //     );
        //     // Asegúrate de retornar las promesas aquí
        //     return Promise.all([groupPromise, adminPromise]);
        //   });
        //
        //   await Promise.all(promises);
        // });
      });
      await session.commitTransaction();
      this.logger.log(
        'Admins added to group successfully Group ID: ' + groupId,
      );
      return;
    } catch (error: any) {
      await session.abortTransaction();
      this.logger.error(
        'An error was ocurred when adding admins to group: ' + error,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteAdminsToGroup(admins: string[], groupId: string): Promise<any> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        for (const admin of admins) {
          await this.groupModel.findByIdAndUpdate(
            groupId,
            { $pull: { admins: admin } },
            { session },
          );
          await this.userModel.findByIdAndUpdate(
            admin,
            { $pull: { groups: groupId } },
            { session },
          );
        }
      });
      await session.commitTransaction();
      this.logger.log(
        'Admins deleted to group successfully Group ID: ' + groupId,
      );
      return;
    } catch (error: any) {
      await session.abortTransaction();
      this.logger.error(
        'An error was ocurred when deleting admins to group: ' + error,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteMembersToGroup(
    membersToDelete: string[],
    groupId: string,
  ): Promise<any> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        //Enfoque FOR
        for (const member of membersToDelete) {
          await this.groupModel.findByIdAndUpdate(
            groupId,
            { $pull: { members: member } },
            { session },
          );
          await this.userModel.findByIdAndUpdate(
            member,
            { $pull: { groups: groupId } },
            { session },
          );
        }
      });
      await session.commitTransaction();
      this.logger.log(
        'Members added to group successfully Group ID: ' + groupId,
      );
      return;
    } catch (error: any) {
      await session.abortTransaction();
      this.logger.error(
        'An error was ocurred when adding Members to group: ' + error,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

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
      const session = await this.connection.startSession();
      session.startTransaction();
      const groups = await this.groupModel
        .find({ name: { $regex: regex } })
        .limit(limit + 1)
        .select(
          '_id name profilePhotoUrl members admins details name magazines rules profilePhotoUrl visibility',
        )
        .populate({
          path: 'members',
          select: '_id username profilePhotoUrl',
        })
        .populate({
          path: 'admins',
          select: '_id username',
        })
        .populate({
          path: 'magazines',
          select: '_id name sections',
          populate: {
            path: 'sections',
            select: 'posts',
            populate: {
              path: 'posts',
              select: 'imagesUrls',
            },
          },
        })
        .sort({ name: 1 })

        .session(session);
      const hasMore = groups.length > limit;
      const groupResponse = groups
        .slice(0, limit)
        .map((group) => this.groupMapper.toGroupResponse(group));

      await session.commitTransaction();
      session.endSession();
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

  async updateGroupById(group: GroupUpdateRequest): Promise<any> {
    try {
      const response = await this.groupModel
        .findByIdAndUpdate(group._id, group)
        .lean();
      return response?._id;
    } catch (error) {
      throw error;
    }
  }
}
