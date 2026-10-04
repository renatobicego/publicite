import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';

import {
  ProductionAuditEntry,
  ProductionAuditRepositoryInterface,
} from '../../domain/repository/production-audit.repository.interface';
import ProductionAuditLogModel, {
  ProductionAuditLogDocument,
} from '../schemas/production-audit-log.schema';

const toEntry = (doc: any): ProductionAuditEntry => ({
  _id: doc._id.toString(),
  production: doc.production.toString(),
  actor: doc.actor.toString(),
  action: doc.action,
  itemIds: (doc.itemIds ?? []).map((id: any) => id.toString()),
  affectedCount: doc.affectedCount ?? 0,
  details: doc.details ?? '{}',
  createdAt: doc.createdAt,
});

@Injectable()
export class ProductionAuditRepository
  implements ProductionAuditRepositoryInterface
{
  constructor(
    @InjectModel(ProductionAuditLogModel.modelName)
    private readonly auditModel: Model<ProductionAuditLogDocument>,
  ) {}

  async create(
    entry: Omit<ProductionAuditEntry, '_id' | 'createdAt'>,
    session?: ClientSession,
  ): Promise<string> {
    const [created] = await this.auditModel.create(
      [
        {
          ...entry,
          production: new Types.ObjectId(entry.production),
          actor: new Types.ObjectId(entry.actor),
          itemIds: entry.itemIds.map((id) => new Types.ObjectId(id)),
        },
      ],
      { session },
    );
    return String(created._id);
  }

  async list(
    productionId: string,
    page: number,
    limit: number,
  ): Promise<{ entries: ProductionAuditEntry[]; total: number }> {
    const query = { production: new Types.ObjectId(productionId) };
    const [docs, total] = await Promise.all([
      this.auditModel
        .find(query)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.auditModel.countDocuments(query),
    ]);
    return { entries: docs.map(toEntry), total };
  }

  async deleteByProduction(
    productionId: string,
    session?: ClientSession,
  ): Promise<void> {
    await this.auditModel.deleteMany(
      { production: new Types.ObjectId(productionId) },
      { session },
    );
  }
}
