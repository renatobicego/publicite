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
import { checkResultModificationOfOperation } from 'src/contexts/shared/functions/checkResultModificationOfOperation';

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

  async assignNewCreatorAndExitGroupById(
    groupId: string,
    newCreator: string,
    creator: string,
  ): Promise<any> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        this.logger.log('Assign new creator ID: ' + newCreator);

        await this.groupModel.updateOne(
          { _id: groupId, creator: creator },
          {
            $set: {
              creator: newCreator,
            },
            $pull: {
              admins: newCreator,
            },
          },
          { session },
        );

        await this.userModel.updateOne(
          { _id: creator },
          { $pull: { groups: groupId } },
          { session },
        );
      });

      this.logger.log('creator has leaved the group');
      this.logger.log(
        'Assign new creator and exit group successfully. Group ID: ' + groupId,
      );
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async acceptGroupInvitation(
    groupId: string,
    userRequestId: string,
  ): Promise<void> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const result = await this.groupModel
          .updateOne(
            {
              _id: groupId,
              'groupNotificationsRequest.groupInvitations': userRequestId,
            },

            { $addToSet: { members: userRequestId } },
            { session },
          )
          .lean();
        checkResultModificationOfOperation(
          result,
          'Member cant be added to group, member is not in group invitation or group does not exist',
        );
        await this.userModel.updateOne(
          { _id: userRequestId },
          { $addToSet: { groups: groupId } },
          { session },
        );
      });

      this.logger.log(
        'Member added to group successfully Group ID: ' + groupId,
      );
    } catch (error: any) {
      session.endSession();
      throw error;
    } finally {
      await session.endSession();
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
      checkResultModificationOfOperation(result);
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

  async acceptJoinGroupRequest(
    newMember: string,
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

            { $addToSet: { members: newMember } },
            { session },
          )
          .lean();
        checkResultModificationOfOperation(result);
        await this.userModel
          .updateOne(
            { _id: newMember },
            { $addToSet: { groups: groupId } },
            { session },
          )
          .lean();
        await session.commitTransaction();
      });
      this.logger.log(
        'Member added to group successfully Group ID: ' + groupId,
      );
      return;
    } catch (error: any) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      this.logger.error(
        'An error was ocurred when adding Member to group: ' + error,
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
        checkResultModificationOfOperation(result);
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

  async deleteGroupById(groupId: string, groupCreator: string): Promise<any> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const groupToDelete = await this.groupModel.findOneAndDelete(
          { _id: groupId, creator: groupCreator },
          { session },
        );

        if (groupToDelete === null) {
          throw new Error('Group does not exist or invalid creator');
        }

        // 3-Elimino las revistas (utilizo el middle para eliminar todas las secciones asociadas)
        await this.groupMagazine.deleteMany({ group: groupId }, { session });
      });
    } catch (error: any) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      throw new Error('Failed to delete group: ' + error.message);
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
          .findOneAndUpdate(
            {
              _id: groupId,
              $or: [{ admins: groupAdmin }, { creator: groupAdmin }],
            },
            { $pullAll: { members: membersToDelete } },
            { session },
          )
          .lean();

        checkResultModificationOfOperation(result);

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
        'Members deleted from group successfully. Group ID: ' + groupId,
      );
      return;
    } catch (error: any) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      this.logger.error(
        'An error occurred when deleting members from group: ' + error,
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

  async exitMemberOrAdminGroupById(
    groupId: string,
    member: string,
  ): Promise<any> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        await this.groupModel.updateOne(
          { _id: groupId },
          {
            $pull: {
              member: member,
              admins: member,
            },
          },
          { session },
        );

        await this.userModel.updateOne(
          { _id: member },
          { $pull: { groups: groupId } },
          { session },
        );
      });

      this.logger.log('User exit group successfully. Group ID: ' + groupId);
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
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

  async findGroupByNameOrAlias(
    name: string,
    limit: number,
    page: number,
    userRequest: string,
  ): Promise<GroupListResponse> {
    try {
      const regex = new RegExp(`${name}`, 'i');
      const session = await this.connection.startSession();
      session.startTransaction();
      const groups = await this.groupModel
        .find({
          $or: [{ name: regex }, { alias: regex }],
        })
        .and([{ visibility: 'public' }])
        .limit(limit + 1)
        .skip((page - 1) * limit)
        .select(
          '_id name profilePhotoUrl members admins details name magazines rules profilePhotoUrl visibility groupNotificationsRequest alias creator',
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
        .session(session)
        .lean();

      const hasMore = groups.length > limit;

      const groupResponse = groups.slice(0, limit).map((group) => {
        let isMember = false;
        let hasJoinRequest = false;
        let hasGroupRequest = false;

        if (
          group.members.map((id) => id.toString()).includes(userRequest) ||
          group.admins.map((id) => id.toString()).includes(userRequest) ||
          group.creator.toString() === userRequest
        ) {
          isMember = true;
        } else if (
          group.groupNotificationsRequest?.joinRequests
            .map((id) => id.toString())
            .includes(userRequest)
        ) {
          hasJoinRequest = true;
        } else if (
          group.groupNotificationsRequest?.groupInvitations
            .map((id) => id.toString())
            .includes(userRequest)
        ) {
          hasGroupRequest = true;
        }

        return {
          group: this.groupMapper.toGroupResponse(group),
          isMember: isMember,
          hasJoinRequest: hasJoinRequest,
          hasGroupRequest: hasGroupRequest,
        };
      });

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

  async removeAdminsFromGroupByGroupId(
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
          .session(session); // Añadir la sesión aquí

        if (!groupToTakeOffAdmin) {
          throw new Error('Group does not exist or invalid admin');
        }

        await this.groupModel.updateOne(
          { _id: groupId },
          {
            $pullAll: { admins: admins },
            $addToSet: { members: { $each: admins } },
          },
          { session },
        );

        await session.commitTransaction();
        this.logger.log(
          'Admins deleted from group successfully. Group ID: ' + groupId,
        );
        return;
      });
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

  async save(group: Group): Promise<GroupResponse> {
    const groupCreator = group.getCreator;
    let newGroup;
    let groupSaved;

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        newGroup = new this.groupModel(group);
        groupSaved = await newGroup.save({ session });

        await this.userModel.findByIdAndUpdate(
          { _id: groupCreator },
          { $addToSet: { groups: groupSaved._id } },
          { session },
        );
      });
      this.logger.log('Group created successfully');
      return this.groupMapper.toGroupResponse(groupSaved);
    } catch (error: any) {
      this.logger.error('An error was ocurred when creating group: ' + error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async isThisGroupExist(alias: string): Promise<boolean> {
    try {
      const group = await this.groupModel.findOne({ alias: alias }).lean();
      if (group) return true;
      return false;
    } catch (error: any) {
      throw error;
    }
  }

  async pushJoinRequest(
    groupId: string,
    userId: string,
    session: any,
  ): Promise<any> {
    try {
      await this.groupModel
        .findOneAndUpdate(
          { _id: groupId },
          {
            $addToSet: {
              'groupNotificationsRequest.joinRequests': userId,
            },
          },
        )
        .session(session)
        .lean();

      this.logger.log(
        'Join request added to group successfully. Group ID: ' + groupId,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async pushGroupInvitations(
    groupId: string,
    userId: string,
    session: any,
  ): Promise<any> {
    try {
      await this.groupModel
        .findOneAndUpdate(
          { _id: groupId },
          {
            $addToSet: {
              'groupNotificationsRequest.groupInvitations': userId,
            },
          },
        )
        .session(session)
        .lean();

      this.logger.log(
        'Group request added to group successfully. Group ID: ' + groupId,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async pullGroupInvitations(
    groupId: string,
    userId: string,
    session: any,
  ): Promise<any> {
    try {
      await this.groupModel
        .findOneAndUpdate(
          { _id: groupId },
          {
            $pull: {
              'groupNotificationsRequest.groupInvitations': userId,
            },
          },
        )
        .session(session)
        .lean();

      this.logger.log(
        'Group request remove to group successfully. Group ID: ' + groupId,
      );
    } catch (error: any) {
      throw error;
    }
  }
  async pullJoinRequest(
    groupId: string,
    userId: string,
    session: any,
  ): Promise<any> {
    try {
      await this.groupModel
        .findOneAndUpdate(
          { _id: groupId },
          {
            $pull: {
              'groupNotificationsRequest.joinRequests': userId,
            },
          },
        )
        .session(session)
        .lean();

      this.logger.log(
        'Join request remove to group successfully. Group ID: ' + groupId,
      );
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
