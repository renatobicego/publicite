import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';

import {
  ProductionComment,
  ProductionCommunityRepositoryInterface,
  ProductionFanEntry,
  ProductionReview,
} from '../../domain/repository/production-community.repository.interface';
import {
  ProductionCommentDocument,
  ProductionCommentModel,
  ProductionFanDocument,
  ProductionFanModel,
  ProductionReviewDocument,
  ProductionReviewModel,
} from '../schemas/production-community.schema';

const oid = (id: string) => new Types.ObjectId(id);
const validIds = (ids: string[]) =>
  ids.filter((id) => Types.ObjectId.isValid(id)).map(oid);
const DUPLICATE_KEY = 11000;

const toReview = (doc: any): ProductionReview => ({
  _id: doc._id.toString(),
  production: doc.production.toString(),
  author: doc.author.toString(),
  review: doc.review,
  rating: doc.rating,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const toComment = (doc: any): ProductionComment => ({
  _id: doc._id.toString(),
  production: doc.production.toString(),
  item: doc.item ? doc.item.toString() : null,
  user: doc.user.toString(),
  comment: doc.comment,
  isEdited: !!doc.isEdited,
  isReply: !!doc.isReply,
  response: doc.response ? doc.response.toString() : null,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

@Injectable()
export class ProductionCommunityRepository
  implements ProductionCommunityRepositoryInterface
{
  constructor(
    @InjectModel(ProductionFanModel.modelName)
    private readonly fanModel: Model<ProductionFanDocument>,
    @InjectModel(ProductionReviewModel.modelName)
    private readonly reviewModel: Model<ProductionReviewDocument>,
    @InjectModel(ProductionCommentModel.modelName)
    private readonly commentModel: Model<ProductionCommentDocument>,
  ) {}

  // --- Fans --------------------------------------------------------------------

  async addFan(
    productionId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<boolean> {
    try {
      await this.fanModel.create(
        [{ production: oid(productionId), user: oid(userId) }],
        { session },
      );
      return true;
    } catch (error: any) {
      if (error?.code === DUPLICATE_KEY) return false;
      throw error;
    }
  }

  async removeFan(
    productionId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<boolean> {
    const result = await this.fanModel.deleteOne(
      { production: oid(productionId), user: oid(userId) },
      { session },
    );
    return (result.deletedCount ?? 0) > 0;
  }

  async listFans(
    productionId: string,
    page: number,
    limit: number,
  ): Promise<{ fans: ProductionFanEntry[]; total: number }> {
    const query = { production: oid(productionId) };
    const [docs, total] = await Promise.all([
      this.fanModel
        .find(query)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.fanModel.countDocuments(query),
    ]);
    return {
      fans: docs.map((doc) => ({
        production: doc.production.toString(),
        user: doc.user.toString(),
        createdAt: doc.createdAt,
      })),
      total,
    };
  }

  async findFanProductionIds(
    userId: string,
    productionIds: string[],
  ): Promise<Set<string>> {
    const ids = validIds(productionIds);
    if (!Types.ObjectId.isValid(userId) || ids.length === 0) return new Set();
    const docs = await this.fanModel
      .find({ user: oid(userId), production: { $in: ids } })
      .select('production')
      .lean();
    return new Set(docs.map((doc) => doc.production.toString()));
  }

  async listFanProductionIds(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ productionIds: string[]; total: number }> {
    const query = { user: oid(userId) };
    const [docs, total] = await Promise.all([
      this.fanModel
        .find(query)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('production')
        .lean(),
      this.fanModel.countDocuments(query),
    ]);
    return {
      productionIds: docs.map((doc) => doc.production.toString()),
      total,
    };
  }

  // --- Reseñas -------------------------------------------------------------------

  async createReview(
    review: Omit<ProductionReview, '_id' | 'createdAt' | 'updatedAt'>,
    session?: ClientSession,
  ): Promise<string> {
    const [created] = await this.reviewModel.create(
      [
        {
          ...review,
          production: oid(review.production),
          author: oid(review.author),
        },
      ],
      { session },
    );
    return String(created._id);
  }

  async findReviewById(id: string): Promise<ProductionReview | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.reviewModel.findById(id).lean();
    return doc ? toReview(doc) : null;
  }

  async updateReview(
    id: string,
    fields: Partial<Pick<ProductionReview, 'review' | 'rating'>>,
    session?: ClientSession,
  ): Promise<ProductionReview | null> {
    const doc = await this.reviewModel
      .findByIdAndUpdate(id, { $set: fields }, { new: true, session })
      .lean();
    return doc ? toReview(doc) : null;
  }

  async deleteReview(id: string, session?: ClientSession): Promise<void> {
    await this.reviewModel.deleteOne({ _id: id }, { session });
  }

  async listReviews(
    productionId: string,
    page: number,
    limit: number,
  ): Promise<{ reviews: ProductionReview[]; total: number }> {
    const query = { production: oid(productionId) };
    const [docs, total] = await Promise.all([
      this.reviewModel
        .find(query)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.reviewModel.countDocuments(query),
    ]);
    return { reviews: docs.map(toReview), total };
  }

  // --- Comentarios ---------------------------------------------------------------

  async createComment(
    comment: Omit<
      ProductionComment,
      '_id' | 'createdAt' | 'updatedAt' | 'isEdited' | 'response'
    >,
    session?: ClientSession,
  ): Promise<string> {
    const [created] = await this.commentModel.create(
      [
        {
          ...comment,
          production: oid(comment.production),
          item: comment.item ? oid(comment.item) : null,
          user: oid(comment.user),
        },
      ],
      { session },
    );
    return String(created._id);
  }

  async findCommentById(id: string): Promise<ProductionComment | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.commentModel.findById(id).lean();
    return doc ? toComment(doc) : null;
  }

  async findCommentsByIds(ids: string[]): Promise<ProductionComment[]> {
    const valid = validIds(ids);
    if (valid.length === 0) return [];
    const docs = await this.commentModel.find({ _id: { $in: valid } }).lean();
    return docs.map(toComment);
  }

  async updateComment(
    id: string,
    comment: string,
  ): Promise<ProductionComment | null> {
    const doc = await this.commentModel
      .findByIdAndUpdate(
        id,
        { $set: { comment, isEdited: true } },
        { new: true },
      )
      .lean();
    return doc ? toComment(doc) : null;
  }

  async setCommentResponse(
    commentId: string,
    responseId: string | null,
    session?: ClientSession,
  ): Promise<void> {
    await this.commentModel.updateOne(
      { _id: commentId },
      { $set: { response: responseId ? oid(responseId) : null } },
      { session },
    );
  }

  async deleteComments(ids: string[], session?: ClientSession): Promise<void> {
    const valid = validIds(ids);
    if (valid.length === 0) return;
    await this.commentModel.deleteMany({ _id: { $in: valid } }, { session });
  }

  async clearResponseReferences(
    replyId: string,
    session?: ClientSession,
  ): Promise<void> {
    await this.commentModel.updateMany(
      { response: oid(replyId) },
      { $set: { response: null } },
      { session },
    );
  }

  async listComments(
    productionId: string,
    itemId: string | null,
    page: number,
    limit: number,
  ): Promise<{ comments: ProductionComment[]; total: number }> {
    const query = {
      production: oid(productionId),
      item: itemId ? oid(itemId) : null,
      isReply: false,
    };
    const [docs, total] = await Promise.all([
      this.commentModel
        .find(query)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.commentModel.countDocuments(query),
    ]);
    return { comments: docs.map(toComment), total };
  }

  // --- Cascada --------------------------------------------------------------------

  async deleteByProduction(
    productionId: string,
    session?: ClientSession,
  ): Promise<void> {
    const query = { production: oid(productionId) };
    await this.fanModel.deleteMany(query, { session });
    await this.reviewModel.deleteMany(query, { session });
    await this.commentModel.deleteMany(query, { session });
  }

  async deleteCommentsByItems(
    productionId: string,
    itemIds: string[],
    session?: ClientSession,
  ): Promise<void> {
    const ids = validIds(itemIds);
    if (ids.length === 0) return;
    await this.commentModel.deleteMany(
      { production: oid(productionId), item: { $in: ids } },
      { session },
    );
  }
}
