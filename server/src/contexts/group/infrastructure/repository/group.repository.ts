import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Inject } from '@nestjs/common';

import { Group } from '../../domain/entity/group.entity';
import { GroupRepositoryInterface } from '../../domain/repository/group.repository.interface';
import { GroupRepositoryMapperInterface } from '../../domain/repository/mapper/group.repository.mapper.interface';
import {
  GroupListResponse,
  GroupResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/group.response';
import { GroupUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.update.request';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { IUser } from 'src/contexts/user/infrastructure/schemas/user.schema';
import { GroupDocument } from '../schemas/group.schema';
import { GroupMagazineDocument } from 'src/contexts/magazine/infrastructure/schemas/magazine.group.schema';

export class GroupRepository implements GroupRepositoryInterface {
  constructor(
    @InjectModel('Group') private readonly groupModel: Model<GroupDocument>,
    @InjectModel('User') private readonly userModel: Model<IUser>,

    @InjectModel('GroupMagazine')
    private readonly groupMagazine: Model<GroupMagazineDocument>,

    @Inject('GroupRepositoryMapperInterface')
    private readonly groupMapper: GroupRepositoryMapperInterface,
    @InjectConnection() private readonly connection: Connection,
    private readonly logger: MyLoggerService,
  ) {}


  checkResultModificationOfOperation(result: any) {
    if (result.matchedCount === 0) {
      throw new Error(
        'Group admin does not have permission or group does not exist.',
      );
    }
  }
  async addMagazinesToGroup(
    magazineIds: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      const result = await this.groupModel
        .updateOne(
          {
            _id: groupId,
            $or: [{ admins: groupAdmin }, { creator: groupAdmin }],
          },
          {
            $addToSet: { magazines: { $each: magazineIds } },
          },
        )
        .lean();
      this.checkResultModificationOfOperation(result);
      this.logger.log(
        'Magazines added to group successfully Group ID: ' + groupId,
      );
      return;
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred when added magazines to group: ' + error,
      );
      throw error;
    }
  }

  async addMembersToGroup(
    members: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const result = await this.groupModel
          .updateOne(
            {
              _id: groupId,
              $or: [{ admins: groupAdmin }, { creator: groupAdmin }],
            },

            { $addToSet: { members: { $each: members } } },
            { session },
          )
          .lean();
        this.checkResultModificationOfOperation(result);
        await this.userModel
          .updateMany(
            { _id: { $in: members } },
            { $addToSet: { groups: groupId } },
            { session },
          )
          .lean();
        await session.commitTransaction();
      });
      this.logger.log(
        'Members added to group successfully Group ID: ' + groupId,
      );
      return;
    } catch (error: any) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      this.logger.error(
        'An error was ocurred when adding Members to group: ' + error,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

  async addAdminsToGroup(
    admins: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const result = await this.groupModel
          .updateOne(
            {
              _id: groupId,
              $or: [{ admins: groupAdmin }, { creator: groupAdmin }],
            },
            { $addToSet: { admins: { $each: admins } } },
            { session },
          )
          .lean();
        this.checkResultModificationOfOperation(result);
        await this.userModel
          .updateMany(
            { _id: { $in: admins } },
            { $addToSet: { groups: groupId } },
            { session },
          )
          .lean();

        await session.commitTransaction();
      });
      this.logger.log(
        'Admins added to group successfully Group ID: ' + groupId,
      );
      return;
    } catch (error: any) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      this.logger.error(
        'An error was ocurred when adding admins to group: ' + error,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }
  async deleteAdminsFromGroup(
    admins: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        // Buscar el grupo y mantener la referencia
        const groupToTakeOffAdmin = await this.groupModel
          .findOne({ _id: groupId, creator: groupAdmin })
          .lean();

        if (!groupToTakeOffAdmin) {
          throw new Error('Group does not exist or invalid admin');
        }
        const amountOfAdmins = groupToTakeOffAdmin.admins.length;
        const amountOfMembers = groupToTakeOffAdmin.members.length;
        if (amountOfAdmins === 1) {
          if (amountOfMembers > 0) {
            throw new Error(
              'Group must have at least one admin if there are members in the group, if you want to delete the admin, you must delete the members first.',
            );
          } else if (amountOfMembers === 0) {
            // 1- Elimino el grupo
            await this.groupModel.deleteOne({ _id: groupId }, { session });

            // 2 - Elimino el id del grupo en el admin
            await this.userModel.updateMany(
              { _id: { $in: admins } },
              { $pull: { groups: groupId } },
              { session },
            );

            // 3-Elimino las revistas (utilizo el middle para eliminar todas las secciones asociadas)
            await this.groupMagazine.deleteMany(
              { group: groupId },
              { session },
            );

            this.logger.log(
              'Group deleted successfully - No members and one admin in the group. Group ID: ' +
                groupId +
                'Magazines deleted from group successfully - sections of magazines deleted',
            );
            await session.commitTransaction();
            return;
          }
        } else {
          await this.groupModel.updateOne(
            { _id: groupId },
            { $pullAll: { admins: admins } },
            { session },
          );

          await this.userModel
            .updateMany(
              { _id: { $in: admins } },
              { $pull: { groups: groupId } },
              { session },
            )
            .lean();

          await session.commitTransaction();
          return;
        }
      });

      this.logger.log(
        'Admins deleted from group successfully. Group ID: ' + groupId,
      );
      return;
    } catch (error: any) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      this.logger.error(
        'An error occurred when deleting admins from group: ' + error,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteMembersFromGroup(
    membersToDelete: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const result = await this.groupModel
          .findByIdAndUpdate(
            {
              _id: groupId,
              $or: [{ admins: groupAdmin }, { creator: groupAdmin }],
            },
            { $pullAll: { members: membersToDelete } },
            { session },
          )
          .lean();

        this.checkResultModificationOfOperation(result);

        await this.userModel
          .updateMany(
            { _id: { $in: membersToDelete } },
            {
              $pull: { groups: groupId },
            },
            { session },
          )
          .lean();
        await session.commitTransaction();
      });
      this.logger.log(
        'Members deleted to group successfully Group ID: ' + groupId,
      );
      return;
    } catch (error: any) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      this.logger.error(
        'An error was ocurred when deleted Members to group: ' + error,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteMagazinesFromGroup(
    magazinesToDelete: string[],
    groupId: string,
    groupAdmin: string,
  ): Promise<any> {
    try {
      await this.groupModel
        .findByIdAndUpdate(
          {
            _id: groupId,
            $or: [{ admins: groupAdmin }, { creator: groupAdmin }],
          },
          {
            $pullAll: { magazines: magazinesToDelete },
          },
        )
        .lean();
      this.logger.log(
        'Magazines deleted to group successfully Group ID: ' + groupId,
      );
      return;
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred when deleted magazines to group: ' + error,
      );
      throw error;
    }
  }

  async findGroupById(id: string): Promise<GroupResponse> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const group = await this.groupModel
        .findById(id)
        .populate([
          {
            path: 'members',
            select: '_id username profilePhotoUrl name lastName',
          },
          { path: 'admins', select: '_id username name lastName' },
          {
            path: 'magazines',
            select: '_id name sections',
            populate: {
              path: 'sections',
              select: '_id posts',
              populate: { path: 'posts', select: '_id imagesUrls' },
            },
          },
        ])
        .session(session)
        .lean();

      await session.commitTransaction();
      return this.groupMapper.toGroupResponse(group);
    } catch (error: any) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findGroupByName(
    name: string,
    limit: number,
    page: number,
  ): Promise<GroupListResponse> {
    try {
      const regex = new RegExp(`${name}`, 'i');
      const session = await this.connection.startSession();
      session.startTransaction();
      const groups = await this.groupModel
        .find({ name: { $regex: regex } })
        .and([{ visibility: 'public' }])
        .limit(limit + 1)
        .skip((page - 1) * limit)
        .select(
          '_id name profilePhotoUrl members admins details name magazines rules profilePhotoUrl visibility',
        )
        .populate([
          {
            path: 'members',
            select: '_id username profilePhotoUrl',
          },
          {
            path: 'admins',
            select: '_id username',
          },
          {
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
          },
        ])
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
