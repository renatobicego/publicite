import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { FriendGroupRepositoryInterface } from '../../domain/repository/friend-group.repository.interface';
import {
  FriendGroupMember,
  FriendGroupMemberStatus,
  FriendGroupRecord,
  FriendGroupStatus,
  FriendGroupUserRef,
  LIVE_FRIEND_GROUP_STATUSES,
} from '../../domain/entity/friend-group.types';

export class FriendGroupRepository implements FriendGroupRepositoryInterface {
  constructor(
    @InjectModel('FriendGroup')
    private readonly groupModel: Model<any>,
    @InjectModel('User')
    private readonly userModel: Model<any>,
  ) {}

  async create(group: Partial<FriendGroupRecord>): Promise<FriendGroupRecord> {
    const created = await this.groupModel.create(group);
    return created.toObject();
  }

  async findById(id: string): Promise<FriendGroupRecord | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.groupModel.findById(id).lean<FriendGroupRecord>();
  }

  async findByInviteCode(code: string): Promise<FriendGroupRecord | null> {
    return this.groupModel
      .findOne({ inviteCode: code.trim().toUpperCase() })
      .lean<FriendGroupRecord>();
  }

  async findLiveGroupOfMember(userId: string): Promise<FriendGroupRecord | null> {
    if (!Types.ObjectId.isValid(userId)) return null;
    return this.groupModel
      .findOne({
        status: { $in: LIVE_FRIEND_GROUP_STATUSES },
        members: {
          $elemMatch: {
            user: new Types.ObjectId(userId),
            status: FriendGroupMemberStatus.accepted,
          },
        },
      })
      .sort({ createdAt: -1 })
      .lean<FriendGroupRecord>();
  }

  async findInvitationsOf(userId: string): Promise<FriendGroupRecord[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    return this.groupModel
      .find({
        status: FriendGroupStatus.forming,
        members: {
          $elemMatch: {
            user: new Types.ObjectId(userId),
            status: FriendGroupMemberStatus.invited,
          },
        },
      })
      .sort({ createdAt: -1 })
      .lean<FriendGroupRecord[]>();
  }

  async updateIfStatus(
    id: string,
    statuses: FriendGroupStatus[],
    fields: Partial<FriendGroupRecord>,
  ): Promise<FriendGroupRecord | null> {
    return this.groupModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), status: { $in: statuses } },
        { $set: fields },
        { new: true },
      )
      .lean<FriendGroupRecord>();
  }

  async update(id: string, fields: Partial<FriendGroupRecord>): Promise<FriendGroupRecord | null> {
    return this.groupModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id) }, { $set: fields }, { new: true })
      .lean<FriendGroupRecord>();
  }

  async addMember(id: string, member: FriendGroupMember): Promise<FriendGroupRecord | null> {
    const userId = new Types.ObjectId(String(member.user));
    return this.groupModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          status: FriendGroupStatus.forming,
          'members.user': { $ne: userId },
        },
        { $push: { members: { ...member, user: userId } } },
        { new: true },
      )
      .lean<FriendGroupRecord>();
  }

  async setMemberStatus(
    id: string,
    userId: string,
    status: string,
    joinedAt: Date,
  ): Promise<FriendGroupRecord | null> {
    return this.groupModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          status: FriendGroupStatus.forming,
          'members.user': new Types.ObjectId(userId),
        },
        { $set: { 'members.$.status': status, 'members.$.joinedAt': joinedAt } },
        { new: true },
      )
      .lean<FriendGroupRecord>();
  }

  async removeMember(id: string, userId: string): Promise<FriendGroupRecord | null> {
    return this.groupModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), status: FriendGroupStatus.forming },
        { $pull: { members: { user: new Types.ObjectId(userId) } } },
        { new: true },
      )
      .lean<FriendGroupRecord>();
  }

  // En aggregate no hay casteo automático: los ids van como ObjectId.
  async findUsersByIds(userIds: string[]): Promise<FriendGroupUserRef[]> {
    const ids = userIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));
    if (ids.length === 0) return [];
    return this.userModel.aggregate<FriendGroupUserRef>([
      { $match: { _id: { $in: ids } } },
      {
        $project: {
          name: 1,
          lastName: 1,
          username: 1,
          businessName: 1,
          profilePhotoUrl: 1,
          postsCount: { $size: { $ifNull: ['$posts', []] } },
          productionsCount: { $size: { $ifNull: ['$productions', []] } },
        },
      },
    ]);
  }
}
