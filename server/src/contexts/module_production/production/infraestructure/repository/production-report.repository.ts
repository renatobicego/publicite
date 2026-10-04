import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';

import { ProductionReportStatus } from '../../domain/entity/enum/production-report.enums';
import {
  ProductionReport,
  ProductionReportRepositoryInterface,
  ProductionReportTargetSummary,
} from '../../domain/repository/production-report.repository.interface';
import ProductionReportModel, {
  ProductionReportDocument,
} from '../schemas/production-report.schema';

const oid = (id: string) => new Types.ObjectId(id);

const targetQuery = (productionId: string, itemId: string | null) => ({
  production: oid(productionId),
  item: itemId ? oid(itemId) : null,
});

const toReport = (doc: any): ProductionReport => ({
  _id: doc._id.toString(),
  production: doc.production.toString(),
  item: doc.item ? doc.item.toString() : null,
  reporter: doc.reporter.toString(),
  reason: doc.reason,
  details: doc.details ?? null,
  status: doc.status,
  reviewedAt: doc.reviewedAt ?? null,
  reviewedBy: doc.reviewedBy ?? null,
  reviewNote: doc.reviewNote ?? null,
  createdAt: doc.createdAt,
});

@Injectable()
export class ProductionReportRepository
  implements ProductionReportRepositoryInterface
{
  constructor(
    @InjectModel(ProductionReportModel.modelName)
    private readonly reportModel: Model<ProductionReportDocument>,
  ) {}

  async create(
    report: Omit<
      ProductionReport,
      '_id' | 'createdAt' | 'status' | 'reviewedAt' | 'reviewedBy' | 'reviewNote'
    >,
  ): Promise<string> {
    const created = await this.reportModel.create({
      ...targetQuery(report.production, report.item),
      reporter: oid(report.reporter),
      reason: report.reason,
      details: report.details,
    });
    return String(created._id);
  }

  async countPending(
    productionId: string,
    itemId: string | null,
  ): Promise<number> {
    return this.reportModel.countDocuments({
      ...targetQuery(productionId, itemId),
      status: ProductionReportStatus.pending,
    });
  }

  async listByTarget(
    productionId: string,
    itemId: string | null,
    status?: ProductionReportStatus,
  ): Promise<ProductionReport[]> {
    const query: Record<string, any> = targetQuery(productionId, itemId);
    if (status) query.status = status;
    const docs = await this.reportModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(toReport);
  }

  async listTargets(
    status: ProductionReportStatus,
    page: number,
    limit: number,
  ): Promise<{ targets: ProductionReportTargetSummary[]; total: number }> {
    const [result] = await this.reportModel.aggregate([
      { $match: { status } },
      {
        $group: {
          _id: { production: '$production', item: '$item' },
          reports: { $sum: 1 },
          reasons: { $addToSet: '$reason' },
          lastReportAt: { $max: '$createdAt' },
        },
      },
      { $sort: { lastReportAt: -1 } },
      {
        $facet: {
          page: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          total: [{ $count: 'value' }],
        },
      },
    ]);

    return {
      targets: (result?.page ?? []).map((row: any) => ({
        production: row._id.production.toString(),
        item: row._id.item ? row._id.item.toString() : null,
        reports: row.reports,
        reasons: row.reasons,
        lastReportAt: row.lastReportAt,
      })),
      total: result?.total?.[0]?.value ?? 0,
    };
  }

  async resolvePending(
    productionId: string,
    itemId: string | null,
    status: ProductionReportStatus,
    adminId: string,
    note: string | null,
    session?: ClientSession,
  ): Promise<number> {
    const result = await this.reportModel.updateMany(
      {
        ...targetQuery(productionId, itemId),
        status: ProductionReportStatus.pending,
      },
      {
        $set: {
          status,
          reviewedAt: new Date(),
          reviewedBy: adminId,
          reviewNote: note,
        },
      },
      { session },
    );
    return result.modifiedCount ?? 0;
  }

  async deleteByProduction(
    productionId: string,
    session?: ClientSession,
  ): Promise<void> {
    await this.reportModel.deleteMany(
      { production: oid(productionId) },
      { session },
    );
  }

  async deleteByItems(
    productionId: string,
    itemIds: string[],
    session?: ClientSession,
  ): Promise<void> {
    const ids = itemIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map(oid);
    if (ids.length === 0) return;
    await this.reportModel.deleteMany(
      { production: oid(productionId), item: { $in: ids } },
      { session },
    );
  }
}
