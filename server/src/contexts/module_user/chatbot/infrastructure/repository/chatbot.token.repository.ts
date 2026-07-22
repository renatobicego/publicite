import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ChatbotTokenRepositoryInterface } from '../../domain/repository/chatbot.token.repository.interface';
import {
  CommunityPoolSnapshot,
  UsageByOwner,
  UsageLogEntry,
} from '../../domain/entity/chatbot.token.types';
import { PlanTokenRef } from 'src/contexts/module_shared/chatbot-tokens/chatbot.tokens.config';
import {
  ChatbotCommunityPoolDocument,
  ChatbotTokenAccountDocument,
  ChatbotTokenAccrualDocument,
  ChatbotUsageLogDocument,
} from '../schemas/chatbot.token.schema';
import { IUser } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { SubscriptionDocument } from 'src/contexts/module_webhook/mercadopago/infastructure/schemas/subscription.schema';

const COMMUNITY_POOL_KEY = 'main';
const PLAN_FIELDS = 'mpPreapprovalPlanId reason isFree isPack';
// Período especial del accrual que acumula la base cargada por la plataforma.
const SEED_ACCRUAL_PERIOD = 'seed';

@Injectable()
export class ChatbotTokenRepository implements ChatbotTokenRepositoryInterface {
  constructor(
    @InjectModel('ChatbotTokenAccount')
    private readonly accountModel: Model<ChatbotTokenAccountDocument>,
    @InjectModel('ChatbotCommunityPool')
    private readonly poolModel: Model<ChatbotCommunityPoolDocument>,
    @InjectModel('ChatbotTokenAccrual')
    private readonly accrualModel: Model<ChatbotTokenAccrualDocument>,
    @InjectModel('ChatbotUsageLog')
    private readonly usageLogModel: Model<ChatbotUsageLogDocument>,
    @InjectModel('User')
    private readonly userModel: Model<IUser>,
    @InjectModel('Subscription')
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async getUserAuthorizedPlans(userId: string): Promise<PlanTokenRef[] | null> {
    const user: any = await this.userModel
      .findById(userId)
      .select('subscriptions -_id')
      .populate({
        path: 'subscriptions',
        select: 'subscriptionPlan status',
        match: { status: 'authorized' },
        populate: {
          path: 'subscriptionPlan',
          select: PLAN_FIELDS,
        },
      })
      .lean();

    if (!user) return null;

    const subscriptions: any[] = user.subscriptions ?? [];
    return subscriptions
      .map((subscription) => subscription?.subscriptionPlan)
      .filter(Boolean)
      .map((plan: any) => ({
        mpPreapprovalPlanId: plan.mpPreapprovalPlanId,
        reason: plan.reason,
        isFree: plan.isFree,
        isPack: plan.isPack,
      }));
  }

  async getUsedRealTokens(
    ownerType: string,
    ownerId: string,
    period: string,
  ): Promise<number> {
    const account = await this.accountModel
      .findOne({ ownerType, ownerId, period })
      .select('usedRealTokens -_id')
      .lean();
    return account?.usedRealTokens ?? 0;
  }

  async addUsage(
    ownerType: string,
    ownerId: string,
    period: string,
    realTokens: number,
  ): Promise<void> {
    await this.accountModel.updateOne(
      { ownerType, ownerId, period },
      {
        $inc: { usedRealTokens: realTokens, requestCount: 1 },
        $set: { lastUsedAt: new Date() },
      },
      { upsert: true },
    );
  }

  async getCommunityBalance(): Promise<number> {
    const pool = await this.poolModel
      .findOne({ key: COMMUNITY_POOL_KEY })
      .select('balanceRealTokens -_id')
      .lean();
    return pool?.balanceRealTokens ?? 0;
  }

  async consumeCommunityTokens(realTokens: number): Promise<void> {
    await this.poolModel.updateOne(
      { key: COMMUNITY_POOL_KEY },
      {
        $inc: {
          balanceRealTokens: -realTokens,
          totalConsumedRealTokens: realTokens,
        },
      },
      { upsert: true },
    );
  }

  async hasAccrualForPeriod(period: string): Promise<boolean> {
    const accrual = await this.accrualModel.exists({ period });
    return accrual != null;
  }

  async tryCreateAccrual(period: string): Promise<boolean> {
    try {
      await this.accrualModel.create({ period });
      return true;
    } catch (error: any) {
      // E11000: otra instancia ganó la carrera y ya está acreditando este período.
      if (error?.code === 11000) return false;
      throw error;
    }
  }

  async getAllAuthorizedPlans(): Promise<PlanTokenRef[]> {
    const subscriptions: any[] = await this.subscriptionModel
      .find({ status: 'authorized' })
      .select('subscriptionPlan -_id')
      .populate({ path: 'subscriptionPlan', select: PLAN_FIELDS })
      .lean();

    return subscriptions
      .map((subscription) => subscription?.subscriptionPlan)
      .filter(Boolean)
      .map((plan: any) => ({
        mpPreapprovalPlanId: plan.mpPreapprovalPlanId,
        reason: plan.reason,
        isFree: plan.isFree,
        isPack: plan.isPack,
      }));
  }

  async finalizeAccrual(
    period: string,
    realTokens: number,
    paidSubscriptionsCount: number,
  ): Promise<void> {
    await this.accrualModel.updateOne(
      { period },
      { $set: { realTokens, paidSubscriptionsCount, completed: true } },
    );
    await this.poolModel.updateOne(
      { key: COMMUNITY_POOL_KEY },
      {
        $inc: {
          balanceRealTokens: realTokens,
          totalAccruedRealTokens: realTokens,
        },
        $set: { lastAccrualPeriod: period },
      },
      { upsert: true },
    );
  }

  async logUsage(entry: UsageLogEntry): Promise<void> {
    const { model, ...rest } = entry;
    await this.usageLogModel.create({ ...rest, aiModel: model });
  }

  async raiseSeedAccrual(targetRealTokens: number): Promise<number> {
    // Asegurar que el doc 'seed' exista (arranca en 0 si es la primera vez).
    try {
      await this.accrualModel.create({ period: SEED_ACCRUAL_PERIOD });
    } catch (error: any) {
      if (error?.code !== 11000) throw error;
    }

    // Subir el acumulado sólo si el objetivo supera lo ya acreditado; el filtro
    // con $lt hace que ante una carrera sólo una instancia acredite el delta.
    const previous = await this.accrualModel.findOneAndUpdate(
      { period: SEED_ACCRUAL_PERIOD, realTokens: { $lt: targetRealTokens } },
      { $set: { realTokens: targetRealTokens, completed: true } },
      { returnDocument: 'before' },
    );
    if (!previous) return 0;

    const delta = targetRealTokens - previous.realTokens;
    await this.poolModel.updateOne(
      { key: COMMUNITY_POOL_KEY },
      {
        $inc: {
          balanceRealTokens: delta,
          totalAccruedRealTokens: delta,
        },
      },
      { upsert: true },
    );
    return delta;
  }

  async getCommunityPoolSnapshot(): Promise<CommunityPoolSnapshot> {
    const pool = await this.poolModel
      .findOne({ key: COMMUNITY_POOL_KEY })
      .lean();
    return {
      balanceRealTokens: pool?.balanceRealTokens ?? 0,
      totalAccruedRealTokens: pool?.totalAccruedRealTokens ?? 0,
      totalConsumedRealTokens: pool?.totalConsumedRealTokens ?? 0,
    };
  }

  async aggregateUsageByOwner(
    chargedTo: string | undefined,
    limit: number,
  ): Promise<UsageByOwner[]> {
    const match = chargedTo ? { chargedTo } : {};
    const rows = await this.usageLogModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { ownerId: '$ownerId', ownerType: '$ownerType' },
          totalRealTokens: { $sum: '$totalRealTokens' },
          requestCount: { $sum: 1 },
          lastUsedAt: { $max: '$createdAt' },
          channels: { $addToSet: '$channel' },
        },
      },
      { $sort: { totalRealTokens: -1 } },
      { $limit: limit },
      {
        // Los ownerId de usuarios registrados son ObjectId serializados; los
        // anónimos (uuid, whatsapp:<tel>) no convierten y quedan sin lookup.
        $addFields: {
          ownerObjectId: {
            $convert: {
              input: '$_id.ownerId',
              to: 'objectId',
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerObjectId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $addFields: { user: { $arrayElemAt: ['$user', 0] } } },
      {
        $project: {
          _id: 0,
          ownerId: '$_id.ownerId',
          ownerType: '$_id.ownerType',
          username: '$user.username',
          email: '$user.email',
          totalRealTokens: 1,
          requestCount: 1,
          lastUsedAt: 1,
          channels: 1,
        },
      },
    ]);
    return rows as UsageByOwner[];
  }
}
