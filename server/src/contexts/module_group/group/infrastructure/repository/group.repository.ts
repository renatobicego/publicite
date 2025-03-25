import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { forwardRef, Inject, OnModuleInit } from '@nestjs/common';

import { Group } from '../../domain/entity/group.entity';
import { GroupRepositoryInterface } from '../../domain/repository/group.repository.interface';
import { GroupRepositoryMapperInterface } from '../../domain/repository/mapper/group.repository.mapper.interface';
import {
  GroupResponse,
  GroupResponseById,
} from '../../application/adapter/dto/HTTP-RESPONSE/group.response';
import { GroupUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.update.request';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { GroupMagazineDocument } from 'src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.group.schema';
import {
  checkIfanyDataWasModified,
  chekResultOfOperation,
} from 'src/contexts/module_shared/utils/functions/check.result.functions';
import { IUser } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { GroupDocument } from '../schemas/group.schema';

import {
  checkStopWordsAndReturnSearchQuery,
  SearchType,
} from 'src/contexts/module_shared/utils/functions/checkStopWordsAndReturnSearchQuery';
import { NotificationRepositoryInterface } from 'src/contexts/module_user/notification/domain/repository/notification.repository.interface';
import { ModuleRef } from '@nestjs/core';

export class GroupRepository implements GroupRepositoryInterface, OnModuleInit {

  private notificationRepository: NotificationRepositoryInterface;
  constructor(
    @InjectModel('Group') private readonly groupModel: Model<GroupDocument>,
    @InjectModel('User') private readonly userModel: Model<IUser>,

    @InjectModel('GroupMagazine')
    private readonly groupMagazine: Model<GroupMagazineDocument>,
    @Inject('GroupRepositoryMapperInterface')
    private readonly groupMapper: GroupRepositoryMapperInterface,

    // @Inject(forwardRef(() => 'NotificationRepositoryInterface'))
    // private readonly notificationRepository: NotificationRepositoryInterface,

    @InjectConnection() private readonly connection: Connection,
    private readonly logger: MyLoggerService,
    private readonly moduleRef: ModuleRef
  ) { }


  onModuleInit() {
    this.notificationRepository = this.moduleRef.get<NotificationRepositoryInterface>(
      "NotificationRepositoryInterface",
      { strict: false }
    );
  }



  async assignNewCreatorAndExitGroupById(
    groupId: string,
    newCreator: string,
    creator: string,
  ): Promise<any> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        this.logger.log('Assign new creator ID: ' + newCreator);

        const resultOfOperation = await this.groupModel.updateOne(
          { _id: groupId, creator: creator, admins: newCreator },
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
        console.log(resultOfOperation)
        chekResultOfOperation(
          resultOfOperation,
          'Group not found or the new creator is not an admin',
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

  async acceptGroupInvitationAndRemoveUserFromGroupInvitation(
    groupId: string,
    userRequestId: string,
    session: any,
  ): Promise<void> {
    try {
      const result = await this.groupModel.findOneAndUpdate(
        {
          _id: groupId,
          'groupNotificationsRequest.groupInvitations': userRequestId,
        },
        {
          $addToSet: { members: userRequestId },
          $pull: {
            'groupNotificationsRequest.groupInvitations': userRequestId,
            'groupNotificationsRequest.joinRequests': userRequestId,
          },

          $unset: { [`userIdAndNotificationMap.${userRequestId}`]: '' },
        },
        {
          projection: { userIdAndNotificationMap: 1 },
          session,
        },
      );

      const notificationID =
        result?.userIdAndNotificationMap.get(userRequestId);

      if (notificationID) {
        await this.setNotificationActionsInFalse(notificationID, session);
      }
      await this.userModel.updateOne(
        { _id: userRequestId },
        { $addToSet: { groups: groupId } },
        { session },
      );

      this.logger.log(
        'Member added to group successfully Group ID: ' + groupId,
      );
    } catch (error: any) {
      throw error;
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
      chekResultOfOperation(result);
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

  async acceptJoinGroupRequestAndRemoveUserFromJoinRequest(
    newMember: string,
    groupId: string,
    groupAdmin: string,
    session: any,
  ): Promise<any> {
    if (!session || session === undefined || session === null) {
      session = await this.connection.startSession();
    }
    try {
      const result = await this.groupModel.updateOne(
        {
          _id: groupId,
          'groupNotificationsRequest.joinRequests': newMember,
          $or: [{ admins: groupAdmin }, { creator: groupAdmin }],
        },
        {
          $addToSet: { members: newMember },
          $pull: {
            'groupNotificationsRequest.joinRequests': newMember,
            'groupNotificationsRequest.groupInvitations': newMember,
          },
        },
        {
          session,
        },
      );

      chekResultOfOperation(result);
      await this.userModel.updateOne(
        { _id: newMember },
        { $addToSet: { groups: groupId } },
        { session },
      );

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
      await session.endSession();
    }
  }

  async addAdminToGroup(
    newAdmin: string,
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
              members: newAdmin,
              $or: [{ admins: groupAdmin }, { creator: groupAdmin }],
            },
            {
              $addToSet: { admins: newAdmin }, //Agregamos nuevo
              $pullAll: { members: [newAdmin] }, // los sacamos de miembros
            },

            { session },
          )
          .lean();
        chekResultOfOperation(
          result,
          'You dont have permissions or the new admin is not a member',
        );

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
    const idsGroupPeopleToDelete: string[] = [];

    try {
      await session.withTransaction(async () => {
        const groupToDelete = await this.groupModel.findOneAndDelete(
          { _id: groupId, creator: groupCreator },
          { session },
        );

        if (groupToDelete === null) {
          throw new Error('Group does not exist or invalid creator');
        }
        idsGroupPeopleToDelete.push(
          ...groupToDelete.members,
          ...groupToDelete.admins,
          groupCreator,
        );
        const idsMappedToString = idsGroupPeopleToDelete.map((id) =>
          id.toString(),
        );

        await this.userModel.updateMany(
          { _id: { $in: idsMappedToString } },
          {
            $pullAll: { groups: [groupId] },
          },
          { session },
        );

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

        chekResultOfOperation(result);

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

  async deleteAccount(id: string): Promise<any> {
    try {
      this.logger.log('Deleting group from account');
  
      let magazinesToDelete: any[] = [];
  
      const groupMagazines = await this.groupModel
        .findOneAndDelete({ creator: id })
        .select('magazines -_id')
        .lean();
  
      if (!groupMagazines) return;
  
      if (groupMagazines.magazines?.length > 0) {
        console.log(groupMagazines);
        this.logger.log('Group has group magazines');
        magazinesToDelete = groupMagazines.magazines;
      }
  
      if (magazinesToDelete.length > 0) {
        console.log(magazinesToDelete);
        this.logger.log('Deleting magazines...');
        await this.groupMagazine.deleteMany({ _id: { $in: magazinesToDelete } });
      }
  
      this.logger.log('Group and associated magazines successfully deleted');
  
      return groupMagazines; 
  
    } catch (error: any) {
      throw error;
    }
  }
  

  async deleteMagazinesFromGroup(
    magazinesToDelete: string[],
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
            $pullAll: { magazines: magazinesToDelete },
          },
        )
        .lean();

      chekResultOfOperation(result);
      if (result.modifiedCount > 0) {
        await this.groupMagazine.deleteMany({ _id: { $in: magazinesToDelete } });
      }

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
    member?: string,
  ): Promise<any> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        await this.groupModel.updateOne(
          { _id: groupId },
          {
            $pull: {
              members: member,
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

  async findGroupById(
    id: string,
    userRequest: string,
  ): Promise<GroupResponseById | null> {
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
          {
            path: 'creator',
            select: '_id username name lastName profilePhotoUrl',
          },
          {
            path: 'admins',
            select: '_id username name lastName profilePhotoUrl',
          },
          {
            path: 'groupNotificationsRequest.groupInvitations',
            select: '_id username profilePhotoUrl ',
          },
          {
            path: 'groupNotificationsRequest.joinRequests',
            select: '_id username profilePhotoUrl ',
          },
          {
            path: 'magazines',
            select: '_id name sections',
            populate: {
              path: 'sections',
              select: '_id posts',
              populate: {
                path: 'posts',
                match: { isActive: true },
                select: '_id imagesUrls',
              },
            },
          },
        ])
        .session(session)
        .lean();

      if (!group) {
        return null;
      }

      const { isMember, hasJoinRequest, hasGroupRequest } =
        this.verify_role_of_user(group, userRequest);

      await session.commitTransaction();
      const groupResponse = this.groupMapper.toGroupResponse(group);

      return {
        group: groupResponse,
        isMember,
        hasJoinRequest,
        hasGroupRequest,
      };
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
  ): Promise<{ groups: any[]; hasMore: boolean }> {
    const session = await this.connection.startSession();
    try {
      const selectedFields =
        '_id name profilePhotoUrl members admins details name magazines rules profilePhotoUrl visibility groupNotificationsRequest alias creator groupNote';

      const result = await session.withTransaction(async () => {
        let query: any = { visibility: 'public' };

        if (name) {
          const textSearchQuery = checkStopWordsAndReturnSearchQuery(name, SearchType.group);
          if (!textSearchQuery) return { groups: [], hasMore: false };

          query.$or = [
            { name: { $regex: textSearchQuery, $options: 'i' } },
            { alias: { $regex: textSearchQuery, $options: 'i' } },
          ];
        }

        const groups = await this.groupModel
          .find(query)
          .select(selectedFields)
          .limit(limit + 1)
          .skip((page - 1) * limit)
          .populate([
            { path: 'members', select: '_id username profilePhotoUrl' },
            { path: 'admins', select: '_id username' },
            {
              path: 'magazines',
              select: '_id name sections',
              populate: {
                path: 'sections',
                select: 'posts',
                populate: { path: 'posts', select: 'imagesUrls' },
              },
            },
          ])
          .sort({ name: 1 })
          .session(session)
          .lean();

        return {
          groups: groups.slice(0, limit),
          hasMore: groups.length > limit,
        };
      });

      return result;
    } catch (error) {
      console.error('Error in findGroupByNameOrAlias:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }


  async isThisGroupExist(alias: string, _id?: string): Promise<boolean> {
    try {
      const group = await this.groupModel
        .findOne({
          alias: alias,
          _id: { $ne: _id },
        })
        .lean();

      return !!group;
    } catch (error: any) {
      throw error;
    }
  }

  async removeAdminsFromGroupByGroupId(
    admins: string[],
    groupId: string,
    groupCreator: string,
  ): Promise<any> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        // Buscar el grupo y mantener la referencia
        const groupToTakeOffAdmin = await this.groupModel
          .findOne({ _id: groupId, creator: groupCreator })
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

  async setNotificationActionsInFalse(notificationId: string, session: any) {
    try {
      this.logger.log(
        'Setting actions false in notification ID: ' + notificationId,
      );

      await this.notificationRepository.setNotificationActionsToFalseById(
        notificationId,
        session,
      );
    } catch (error: any) {
      throw error;
    }
  }

  verify_role_of_user(
    group: any,
    userRequest: string,
  ): {
    isMember: boolean;
    hasJoinRequest: boolean;
    hasGroupRequest: boolean;
  } {
    let isMember = false;
    let hasJoinRequest = false;
    let hasGroupRequest = false;

    const userIsMember = group.members
      .map((member: any) => member._id.toString())
      .includes(userRequest);

    const userIsAdmin = group.admins
      .map((admin: any) => admin._id.toString())
      .includes(userRequest);

    const userIsCreator = group.creator
      ? group.creator._id.toString() === userRequest
      : false;
    hasJoinRequest =
      group.groupNotificationsRequest?.joinRequests?.some(
        (user: any) => user._id.toString() === userRequest,
      ) || false;

    hasGroupRequest =
      group.groupNotificationsRequest?.groupInvitations?.some(
        (user: any) => user._id.toString() === userRequest,
      ) || false;

    if (userIsMember || userIsAdmin || userIsCreator) {
      isMember = true;
    } else if (!userIsAdmin && !userIsCreator) {
      group.groupNotificationsRequest = group.groupNotificationsRequest || {};
      group.groupNotificationsRequest.groupInvitations = [
        'You can’t access here; you are not an admin',
      ];
      group.groupNotificationsRequest.joinRequests = [
        'You can’t access here; you are not an admin',
      ];
    }

    return {
      isMember,
      hasJoinRequest,
      hasGroupRequest,
    };
  }

  async pushJoinRequest(
    groupId: string,
    userId: string,
    session: any,
  ): Promise<any> {
    try {
      const result = await this.groupModel
        .updateOne(
          { _id: groupId },
          {
            $addToSet: {
              'groupNotificationsRequest.joinRequests': userId,
            },
          },
        )
        .session(session)
        .lean();
      checkIfanyDataWasModified(result);

      this.logger.log(
        'Join request added to group successfully. Group ID: ' + groupId,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async pushGroupInvitationsAndMakeUserMapNotification(
    notificationId: string,
    groupId: string,
    userId: string,
    session: any,
  ): Promise<any> {
    try {

      const userNotificationMap = new Map<string, string>();
      userNotificationMap.set(userId, notificationId);

      await this.groupModel
        .updateOne(
          { _id: groupId },
          {
            $addToSet: {
              'groupNotificationsRequest.groupInvitations': userId,
            },
            $set: { [`userIdAndNotificationMap.${userId}`]: notificationId },
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

      const result = await this.groupModel
        .findOneAndUpdate(
          { _id: groupId },
          {
            $pull: { 'groupNotificationsRequest.groupInvitations': userId },
            $unset: { [`userIdAndNotificationMap.${userId}`]: '' },
          },
          { projection: { userIdAndNotificationMap: 1 }, session },
        )
        .session(session);
      checkIfanyDataWasModified(result);

      const notificationID = result?.userIdAndNotificationMap.get(userId);
      if (notificationID) {
        this.logger.log(
          'Setting actions false in notification ID: ' + notificationID,
        );
        await this.notificationRepository.setNotificationActionsToFalseById(
          notificationID,
        );
      }


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
      const result = await this.groupModel
        .updateOne(
          { _id: groupId },
          {
            $pull: {
              'groupNotificationsRequest.joinRequests': userId,
            },
          },
        )
        .session(session);
      checkIfanyDataWasModified(result);

      this.logger.log(
        'Join request remove to group successfully. Group ID: ' + groupId,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async updateGroupById(
    group: GroupUpdateRequest,
    userRequestId: string,
  ): Promise<any> {
    try {
      const response = await this.groupModel
        .findOneAndUpdate(
          {
            _id: group._id,
            $or: [{ creator: userRequestId }, { admins: userRequestId }],
          },
          group,
        )
        .select('_id')
        .lean();
      return response?._id;
    } catch (error) {
      throw error;
    }
  }
}
