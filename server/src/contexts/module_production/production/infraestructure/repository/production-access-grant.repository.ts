import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';

import {
  ProductionAccessGrantRepositoryInterface,
  ProductionAccessGrantState,
} from '../../domain/repository/production-access-grant.repository.interface';
import ProductionAccessGrantModel, {
  ProductionAccessGrantDocument,
} from '../schemas/production-access-grant.schema';

const key = (productionId: string, userId: string) => ({
  production: new Types.ObjectId(productionId),
  user: new Types.ObjectId(userId),
});

const toState = (doc: any): ProductionAccessGrantState => ({
  keyVersion: doc?.keyVersion ?? null,
  failedAttempts: doc?.failedAttempts ?? 0,
  lockedUntil: doc?.lockedUntil ?? null,
});

@Injectable()
export class ProductionAccessGrantRepository
  implements ProductionAccessGrantRepositoryInterface
{
  constructor(
    @InjectModel(ProductionAccessGrantModel.modelName)
    private readonly grantModel: Model<ProductionAccessGrantDocument>,
  ) {}

  async find(
    productionId: string,
    userId: string,
  ): Promise<ProductionAccessGrantState | null> {
    const doc = await this.grantModel.findOne(key(productionId, userId)).lean();
    return doc ? toState(doc) : null;
  }

  async grant(
    productionId: string,
    userId: string,
    keyVersion: number,
  ): Promise<void> {
    await this.grantModel.updateOne(
      key(productionId, userId),
      {
        $set: {
          keyVersion,
          grantedAt: new Date(),
          failedAttempts: 0,
          lockedUntil: null,
        },
      },
      { upsert: true },
    );
  }

  async registerFailure(
    productionId: string,
    userId: string,
    maxAttempts: number,
    lockUntil: Date,
  ): Promise<ProductionAccessGrantState> {
    const doc = await this.grantModel
      .findOneAndUpdate(
        key(productionId, userId),
        [
          {
            $set: {
              failedAttempts: {
                $add: [{ $ifNull: ['$failedAttempts', 0] }, 1],
              },
            },
          },
          {
            // Al llegar al máximo se bloquea y el contador vuelve a cero.
            $set: {
              lockedUntil: {
                $cond: [
                  { $gte: ['$failedAttempts', maxAttempts] },
                  lockUntil,
                  { $ifNull: ['$lockedUntil', null] },
                ],
              },
              failedAttempts: {
                $cond: [
                  { $gte: ['$failedAttempts', maxAttempts] },
                  0,
                  '$failedAttempts',
                ],
              },
              keyVersion: { $ifNull: ['$keyVersion', null] },
              grantedAt: { $ifNull: ['$grantedAt', null] },
            },
          },
        ],
        { upsert: true, new: true },
      )
      .lean();
    return toState(doc);
  }

  async deleteByProduction(
    productionId: string,
    session?: ClientSession,
  ): Promise<void> {
    await this.grantModel.deleteMany(
      { production: new Types.ObjectId(productionId) },
      { session },
    );
  }
}
