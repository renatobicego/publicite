import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Inject } from '@nestjs/common';

import { Group } from '../../domain/entity/group.entity';
import { GroupRepositoryInterface } from '../../domain/repository/group.repository.interface';
import { GroupRepositoryMapperInterface } from '../../domain/repository/mapper/group.repository.mapper.interface';
import {
  GroupListResponse,
  GroupResponse,
  GroupResponseById,
} from '../../application/adapter/dto/HTTP-RESPONSE/group.response';
import { GroupUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/group.update.request';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { GroupMagazineDocument } from 'src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.group.schema';
import { checkIfanyDataWasModified, chekResultOfOperation } from 'src/contexts/module_shared/utils/functions/check.result.functions';
import { IUser } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { GroupDocument } from '../schemas/group.schema';
import { PostsMemberGroupResponse } from '../../application/adapter/dto/HTTP-RESPONSE/group.posts.member.response';
import { checkStopWordsAndReturnSearchQuery, SearchType } from 'src/contexts/module_shared/utils/functions/checkStopWordsAndReturnSearchQuery';

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
  ) { }

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
        chekResultOfOperation(
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
        chekResultOfOperation(result);
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
        // await this.userModel
        //   .updateMany(
        //     { _id: { $in: admins } },
        //     { $addToSet: { groups: groupId } },
        //     { session },
        //   )
        //   .lean();

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
          { $pullAll: { groups: groupId } },
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
              populate: { path: 'posts', select: '_id imagesUrls' },
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

  async findAllPostsOfGroupMembers(
    groupId: string,
    userRequest: string,
    limit: number,
    page: number,
  ): Promise<PostsMemberGroupResponse | null> {
    const session = await this.connection.startSession();
    session.startTransaction();
    const populatePostsFields = {
      path: 'posts',
      select:
        '_id imagesUrls title description price frequencyPrice toPrice petitionType postType location',
      populate: {
        path: 'location',
        model: 'PostLocation',
        select: 'description',
      },
      options: {
        limit: limit,
        skip: (page - 1) * limit,
      },
    };
    const userSelectFields = '_id username name lastName posts profilePhotoUrl';

    try {
      const group: any = await this.groupModel
        .find({
          _id: groupId,
          $or: [
            { members: userRequest },
            { admins: userRequest },
            { creator: userRequest },
          ],
        })
        .select('_id members admins creator')
        .populate([
          {
            path: 'members',
            select: userSelectFields,
            populate: populatePostsFields,
          },
          {
            path: 'creator',
            select: userSelectFields,
            populate: populatePostsFields,
          },
          {
            path: 'admins',
            select: userSelectFields,
            populate: populatePostsFields,
          },
        ])
        .session(session)
        .lean();
      if (!group || group.length === 0) {
        return null;
      }

      const memberWithPost = group[0].members.filter((member: any) => {
        return member.posts.length > 0;
      });

      const adminWithPost = group[0].admins.filter((admin: any) => {
        return admin.posts.length > 0;
      });

      const creatorWithPost = group[0].creator;

      const adminAndMemberPosts = memberWithPost
        .concat(adminWithPost)
        .concat(creatorWithPost);

      const hasMore = adminAndMemberPosts.length > limit;

      return {
        userAndPosts: adminAndMemberPosts,
        hasMore: hasMore,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async findGroupByNameOrAlias(
    name: string,
    limit: number,
    page: number,
  ): Promise<{
    groups: any[],
    hasMore: boolean
  }> {
    try {
      const session = await this.connection.startSession();
      session.startTransaction();
      let groups;

      if (name) {
        const textSearchQuery = checkStopWordsAndReturnSearchQuery(name, SearchType.group);
        if (!textSearchQuery) {
          return {
            groups: [],
            hasMore: false,
          }
        };

        groups = await this.groupModel
          .find({
            $or: [
              { name: { $regex: textSearchQuery, $options: 'i' } },
              { alias: { $regex: textSearchQuery, $options: 'i' } },
            ]
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

      } else {
        groups = await this.groupModel
          .find()
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
      }

      const hasMore = groups.length > limit;
      if (groups.length <= 0) {
        return {
          groups: [],
          hasMore: false,
        };
      }


      const groupResponse = groups.slice(0, limit)

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



  async isThisGroupExist(alias: string, _id?: string): Promise<boolean> {
    try {


      const group = await this.groupModel.findOne({
        alias: alias,
        _id: { $ne: _id },
      }).lean();

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

    const userIsCreator = group.creator.toString() === userRequest;
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

  async pushGroupInvitations(
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
              'groupNotificationsRequest.groupInvitations': userId,
            },
          },
        )
        .session(session)
        .lean();
      checkIfanyDataWasModified(result);
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
        .updateOne(
          { _id: groupId },
          {
            $pull: {
              'groupNotificationsRequest.groupInvitations': userId,
            },
          },
        )
        .session(session)
      checkIfanyDataWasModified(result);
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
        .session(session)
      checkIfanyDataWasModified(result);

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
