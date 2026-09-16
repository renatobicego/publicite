import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';

import {
  ProductionTicket,
  ProductionTicketPurchase,
  purchaseFromDocument,
  ticketFromDocument,
} from '../../domain/entity/production-ticket.entity';
import { ProductionTicketPurchaseStatus } from '../../domain/entity/enum/production-ticket.enums';
import {
  ProductionPurchaseListFilter,
  ProductionTicketPurchaseRepositoryInterface,
  ProductionTicketRepositoryInterface,
} from '../../domain/repository/production-ticket.repository.interface';
import ProductionTicketModel, {
  ProductionTicketDocument,
} from '../schemas/production-ticket.schema';
import ProductionTicketPurchaseModel, {
  ProductionTicketPurchaseDocument,
} from '../schemas/production-ticket-purchase.schema';

const oid = (id: string) => new Types.ObjectId(id);
const validIds = (ids: string[]) =>
  ids.filter((id) => Types.ObjectId.isValid(id)).map(oid);

const { active, expired, pending, confirmed, cancelled, rejected } =
  ProductionTicketPurchaseStatus;

@Injectable()
export class ProductionTicketRepository
  implements ProductionTicketRepositoryInterface
{
  constructor(
    @InjectModel(ProductionTicketModel.modelName)
    private readonly ticketModel: Model<ProductionTicketDocument>,
  ) {}

  async create(
    ticket: Omit<ProductionTicket, '_id'>,
    session?: ClientSession,
  ): Promise<string> {
    const [created] = await this.ticketModel.create(
      [
        {
          ...ticket,
          production: oid(ticket.production),
          target: ticket.target ? oid(ticket.target) : null,
          createdBy: oid(ticket.createdBy),
        },
      ],
      { session },
    );
    return String(created._id);
  }

  async findById(id: string): Promise<ProductionTicket | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.ticketModel.findById(id).lean();
    return doc ? ticketFromDocument(doc) : null;
  }

  async findByProduction(productionId: string): Promise<ProductionTicket[]> {
    const docs = await this.ticketModel
      .find({ production: oid(productionId) })
      .sort({ createdAt: 1 })
      .lean();
    return docs.map(ticketFromDocument);
  }

  async updateById(
    id: string,
    fields: Partial<ProductionTicket>,
  ): Promise<ProductionTicket | null> {
    const doc = await this.ticketModel
      .findByIdAndUpdate(id, { $set: fields }, { new: true })
      .lean();
    return doc ? ticketFromDocument(doc) : null;
  }

  async deleteById(id: string, session?: ClientSession): Promise<void> {
    await this.ticketModel.deleteOne({ _id: id }, { session });
  }

  async deleteByProduction(
    productionId: string,
    session?: ClientSession,
  ): Promise<void> {
    await this.ticketModel.deleteMany(
      { production: oid(productionId) },
      { session },
    );
  }

  async deleteByTargets(
    productionId: string,
    targetIds: string[],
    session?: ClientSession,
  ): Promise<string[]> {
    if (targetIds.length === 0) return [];
    const query = {
      production: oid(productionId),
      target: { $in: validIds(targetIds) },
    };
    const tickets = await this.ticketModel
      .find(query)
      .select('_id')
      .session(session ?? null)
      .lean();
    if (tickets.length === 0) return [];
    await this.ticketModel.deleteMany(query, { session });
    return tickets.map((ticket) => ticket._id.toString());
  }
}

@Injectable()
export class ProductionTicketPurchaseRepository
  implements ProductionTicketPurchaseRepositoryInterface
{
  constructor(
    @InjectModel(ProductionTicketPurchaseModel.modelName)
    private readonly purchaseModel: Model<ProductionTicketPurchaseDocument>,
  ) {}

  private buildQuery(filter: ProductionPurchaseListFilter) {
    const query: Record<string, any> = {};
    if (filter.ticketId) query.ticket = oid(filter.ticketId);
    if (filter.productionId) query.production = oid(filter.productionId);
    if (filter.productionIds) {
      query.production = { $in: validIds(filter.productionIds) };
    }
    if (filter.buyerId) query.buyer = oid(filter.buyerId);
    if (filter.statuses?.length) query.status = { $in: filter.statuses };
    if (filter.payoutStatus) query.payoutStatus = filter.payoutStatus;
    if (filter.isPaid !== undefined) query.isPaid = filter.isPaid;
    if (filter.hasFactura === true) query.facturaUrl = { $ne: null };
    if (filter.hasFactura === false) query.facturaUrl = null;
    return query;
  }

  async create(
    purchase: Omit<ProductionTicketPurchase, '_id'>,
    session?: ClientSession,
  ): Promise<string> {
    const [created] = await this.purchaseModel.create(
      [
        {
          ...purchase,
          ticket: oid(purchase.ticket),
          production: oid(purchase.production),
          target: purchase.target ? oid(purchase.target) : null,
          buyer: oid(purchase.buyer),
          creator: oid(purchase.creator),
        },
      ],
      { session },
    );
    return String(created._id);
  }

  async findById(id: string): Promise<ProductionTicketPurchase | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.purchaseModel.findById(id).lean();
    return doc ? purchaseFromDocument(doc) : null;
  }

  async findOpen(
    ticketId: string,
    buyerId: string,
  ): Promise<ProductionTicketPurchase | null> {
    const doc = await this.purchaseModel
      .findOne({ ticket: oid(ticketId), buyer: oid(buyerId), isOpen: true })
      .lean();
    return doc ? purchaseFromDocument(doc) : null;
  }

  async findActiveByBuyer(
    buyerId: string,
    productionId: string,
    now: Date,
  ): Promise<ProductionTicketPurchase[]> {
    const docs = await this.purchaseModel
      .find({
        buyer: oid(buyerId),
        production: oid(productionId),
        status: active,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      })
      .lean();
    return docs.map(purchaseFromDocument);
  }

  async transition(
    id: string,
    fromStatuses: ProductionTicketPurchaseStatus[],
    fields: Partial<ProductionTicketPurchase>,
  ): Promise<ProductionTicketPurchase | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.purchaseModel
      .findOneAndUpdate(
        { _id: oid(id), status: { $in: fromStatuses } },
        { $set: fields },
        { new: true },
      )
      .lean();
    return doc ? purchaseFromDocument(doc) : null;
  }

  async updateById(
    id: string,
    fields: Partial<ProductionTicketPurchase>,
  ): Promise<ProductionTicketPurchase | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.purchaseModel
      .findByIdAndUpdate(id, { $set: fields }, { new: true })
      .lean();
    return doc ? purchaseFromDocument(doc) : null;
  }

  async expireOverdue(
    filter: ProductionPurchaseListFilter,
    now: Date,
  ): Promise<number> {
    const result = await this.purchaseModel.updateMany(
      {
        ...this.buildQuery(filter),
        status: active,
        expiresAt: { $ne: null, $lte: now },
      },
      {
        $set: {
          status: expired,
          isOpen: false,
          expiredAt: now,
          statusReason: 'Venció la duración del ticket',
        },
      },
    );
    return result.modifiedCount ?? 0;
  }

  async list(
    filter: ProductionPurchaseListFilter,
    page: number,
    limit: number,
  ): Promise<{ purchases: ProductionTicketPurchase[]; total: number }> {
    const query = this.buildQuery(filter);
    const [docs, total] = await Promise.all([
      this.purchaseModel
        .find(query)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.purchaseModel.countDocuments(query),
    ]);
    return { purchases: docs.map(purchaseFromDocument), total };
  }

  async countByTickets(
    ticketIds: string[],
  ): Promise<Map<string, { purchases: number; active: number; revenue: number }>> {
    const result = new Map<
      string,
      { purchases: number; active: number; revenue: number }
    >();
    const ids = validIds(ticketIds);
    if (ids.length === 0) return result;

    const now = new Date();
    const rows = await this.purchaseModel.aggregate([
      {
        $match: {
          ticket: { $in: ids },
          status: { $nin: [cancelled, rejected] },
        },
      },
      {
        $group: {
          _id: '$ticket',
          purchases: { $sum: 1 },
          active: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', active] },
                    {
                      $or: [
                        { $eq: ['$expiresAt', null] },
                        { $gt: ['$expiresAt', now] },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          revenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    '$isPaid',
                    { $in: ['$status', [confirmed, active, expired]] },
                  ],
                },
                '$amount',
                0,
              ],
            },
          },
        },
      },
    ]);
    rows.forEach((row) =>
      result.set(row._id.toString(), {
        purchases: row.purchases,
        active: row.active,
        revenue: row.revenue,
      }),
    );
    return result;
  }

  async markFirstAccess(
    buyerId: string,
    purchaseIds: string[],
    now: Date,
  ): Promise<void> {
    const ids = validIds(purchaseIds);
    if (ids.length === 0) return;
    await this.purchaseModel.updateMany(
      { _id: { $in: ids }, buyer: oid(buyerId), firstAccessAt: null },
      { $set: { firstAccessAt: now } },
    );
  }

  async closeByFilter(
    filter: { productionId: string; ticketIds?: string[] },
    reason: string,
    now: Date,
    session?: ClientSession,
  ): Promise<void> {
    const base: Record<string, any> = { production: oid(filter.productionId) };
    if (filter.ticketIds) {
      if (filter.ticketIds.length === 0) return;
      base.ticket = { $in: validIds(filter.ticketIds) };
    }

    await this.purchaseModel.updateMany(
      { ...base, status: { $in: [pending, confirmed] } },
      {
        $set: {
          status: cancelled,
          isOpen: false,
          statusReason: reason,
        },
      },
      { session },
    );
    await this.purchaseModel.updateMany(
      { ...base, status: active },
      {
        $set: {
          status: expired,
          isOpen: false,
          expiredAt: now,
          statusReason: reason,
        },
      },
      { session },
    );
    if (!filter.ticketIds) {
      // Con el blog cerrado ya no hay nada que reseñar: no debe bloquear.
      await this.purchaseModel.updateMany(
        { ...base, reviewedAt: null },
        { $set: { reviewRequired: false } },
        { session },
      );
    }
  }

  async findPendingReview(
    buyerId: string,
  ): Promise<ProductionTicketPurchase | null> {
    if (!Types.ObjectId.isValid(buyerId)) return null;
    const doc = await this.purchaseModel
      .findOne({
        buyer: oid(buyerId),
        reviewRequired: true,
        reviewedAt: null,
        firstAccessAt: { $ne: null },
        status: { $in: [active, expired] },
      })
      .sort({ firstAccessAt: 1 })
      .lean();
    return doc ? purchaseFromDocument(doc) : null;
  }

  async markReviewed(
    buyerId: string,
    productionId: string,
    now: Date,
    session?: ClientSession,
  ): Promise<number> {
    const result = await this.purchaseModel.updateMany(
      {
        buyer: oid(buyerId),
        production: oid(productionId),
        reviewedAt: null,
      },
      { $set: { reviewedAt: now } },
      { session },
    );
    return result.modifiedCount ?? 0;
  }

  async hasPurchaseForProduction(
    buyerId: string,
    productionId: string,
  ): Promise<boolean> {
    const found = await this.purchaseModel.exists({
      buyer: oid(buyerId),
      production: oid(productionId),
      status: { $in: [active, expired] },
    });
    return !!found;
  }
}
