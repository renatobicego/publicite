import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { PlanGiftRepositoryInterface } from '../../domain/repository/plan-gift.repository.interface';
import {
  PlanGiftRecord,
  PlanGiftStatus,
  PlanGiftUserRef,
} from '../../domain/entity/plan-gift.types';

const USER_FIELDS = 'name lastName username email';

export class PlanGiftRepository implements PlanGiftRepositoryInterface {
  constructor(
    @InjectModel('PlanGift')
    private readonly giftModel: Model<any>,
    @InjectModel('User')
    private readonly userModel: Model<any>,
  ) {}

  async create(gift: Partial<PlanGiftRecord>): Promise<PlanGiftRecord> {
    const created = await this.giftModel.create(gift);
    return created.toObject();
  }

  async findById(id: string): Promise<PlanGiftRecord | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.giftModel.findById(id).lean<PlanGiftRecord>();
  }

  async findByCode(code: string): Promise<PlanGiftRecord | null> {
    return this.giftModel.findOne({ code: code.trim().toUpperCase() }).lean<PlanGiftRecord>();
  }

  async update(id: string, fields: Partial<PlanGiftRecord>): Promise<PlanGiftRecord | null> {
    return this.giftModel
      .findByIdAndUpdate(id, { $set: fields }, { new: true })
      .lean<PlanGiftRecord>();
  }

  async findUnassignedByEmail(
    email: string,
    statuses: PlanGiftStatus[],
  ): Promise<PlanGiftRecord[]> {
    return this.giftModel
      .find({ recipient: null, recipientEmail: email, status: { $in: statuses } })
      .lean<PlanGiftRecord[]>();
  }

  async findByGiver(userId: string): Promise<PlanGiftRecord[]> {
    return this.giftModel.find({ giver: userId }).sort({ createdAt: -1 }).lean<PlanGiftRecord[]>();
  }

  async findByRecipient(userId: string): Promise<PlanGiftRecord[]> {
    return this.giftModel
      .find({ recipient: userId, status: { $in: [PlanGiftStatus.paid, PlanGiftStatus.active] } })
      .sort({ createdAt: -1 })
      .lean<PlanGiftRecord[]>();
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{ gifts: PlanGiftRecord[]; hasMore: boolean }> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);
    const gifts = await this.giftModel
      .find({})
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit + 1)
      .lean<PlanGiftRecord[]>();
    return { gifts: gifts.slice(0, safeLimit), hasMore: gifts.length > safeLimit };
  }

  async findUserById(userId: string): Promise<PlanGiftUserRef | null> {
    if (!Types.ObjectId.isValid(userId)) return null;
    return this.userModel.findById(userId).select(USER_FIELDS).lean<PlanGiftUserRef>();
  }

  async findUserByEmail(email: string): Promise<PlanGiftUserRef | null> {
    return this.userModel
      .findOne({ email: email.trim().toLowerCase() })
      .select(USER_FIELDS)
      .lean<PlanGiftUserRef>();
  }

  async findUsersByIds(userIds: string[]): Promise<PlanGiftUserRef[]> {
    const ids = userIds.filter((id) => Types.ObjectId.isValid(id));
    if (ids.length === 0) return [];
    return this.userModel.find({ _id: { $in: ids } }).select(USER_FIELDS).lean<PlanGiftUserRef[]>();
  }
}
