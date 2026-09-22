import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import {
  PostSeudoBaseRepositoryInterface,
  PostSeudoBaseRow,
  PostSeudoBaseSearchCriteria,
} from '../../domain/repository/post-seudobase.repository.interface';
import { PostType } from '../../domain/entity/enum/post-type.enum';
import { Visibility } from '../../domain/entity/enum/post-visibility.enum';
import { PostDocument } from '../schemas/post.schema';
import {
  UserModel,
  IUser,
} from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { PostReactionDocument } from '../schemas/post.reaction.schema';
import { PostCommentDocument } from '../schemas/post.comment.schema';
import { PostReviewDocument } from 'src/contexts/module_post/PostReview/infrastructure/schemas/review.schema';

const toRow = (doc: any): PostSeudoBaseRow => ({
  _id: doc._id.toString(),
  postType: doc.postType,
  title: doc.title,
  // good/service guardan imagesUrls; petition no tiene portada.
  imageUrl:
    Array.isArray(doc.imagesUrls) && doc.imagesUrls.length > 0
      ? doc.imagesUrls[0]
      : null,
  price: doc.price,
  visibility: doc.visibility?.post ?? Visibility.public,
  isActive: !!doc.isActive,
  endDate: doc.endDate ?? null,
  createdAt: doc._id?.getTimestamp?.() ?? null,
});

/**
 * Repositorio de la SeudoBase de Anuncios: listado por autor con filtros y
 * operaciones masivas (precio, visibilidad, borrado en cascada). Opera sobre
 * la colección `posts` filtrando SIEMPRE por `author` para no tocar anuncios
 * ajenos.
 */
@Injectable()
export class PostSeudoBaseRepository
  implements PostSeudoBaseRepositoryInterface
{
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel('Post')
    private readonly postDocument: Model<PostDocument>,
    @InjectModel(UserModel.modelName)
    private readonly userDocument: Model<IUser>,
    @InjectModel('PostReaction')
    private readonly postReactionDocument: Model<PostReactionDocument>,
    @InjectModel('PostComment')
    private readonly postCommentDocument: Model<PostCommentDocument>,
    @InjectModel('PostReview')
    private readonly postReviewDocument: Model<PostReviewDocument>,
  ) {}

  private buildQuery(criteria: PostSeudoBaseSearchCriteria): Record<string, any> {
    const query: Record<string, any> = {
      author: new Types.ObjectId(criteria.authorId),
    };
    if (criteria.postTypes && criteria.postTypes.length > 0) {
      query.postType = { $in: criteria.postTypes };
    }
    if (typeof criteria.isActive === 'boolean') {
      query.isActive = criteria.isActive;
    }
    if (criteria.searchRegex) {
      query.searchTitle = criteria.searchRegex;
    }
    return query;
  }

  async search(
    criteria: PostSeudoBaseSearchCriteria,
    page: number,
    limit: number,
  ): Promise<{ rows: PostSeudoBaseRow[]; total: number; hasMore: boolean }> {
    const query = this.buildQuery(criteria);
    const [docs, total] = await Promise.all([
      this.postDocument
        .find(query)
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.postDocument.countDocuments(query),
    ]);
    return {
      rows: docs.map(toRow),
      total,
      hasMore: page * limit < total,
    };
  }

  async findOwnedByIds(
    authorId: string,
    postIds: string[],
  ): Promise<PostSeudoBaseRow[]> {
    const docs = await this.postDocument
      .find({
        _id: { $in: postIds.map((id) => new Types.ObjectId(id)) },
        author: new Types.ObjectId(authorId),
      })
      .lean();
    return docs.map(toRow);
  }

  async bulkSetPrice(
    updates: { postId: string; price: number }[],
    session?: ClientSession,
  ): Promise<void> {
    if (updates.length === 0) return;
    const operations = updates.map((update) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(update.postId) },
        update: { $set: { price: update.price } },
      },
    }));
    await this.postDocument.bulkWrite(operations, { session });
  }

  async bulkSetVisibility(
    authorId: string,
    postIds: string[],
    visibility: Visibility,
    session?: ClientSession,
  ): Promise<void> {
    if (postIds.length === 0) return;
    await this.postDocument.updateMany(
      {
        _id: { $in: postIds.map((id) => new Types.ObjectId(id)) },
        author: new Types.ObjectId(authorId),
      },
      { $set: { 'visibility.post': visibility } },
      { session },
    );
  }

  /**
   * Hard delete en cascada de un lote de anuncios: replica el borrado de
   * `deletePostById` (reviews, reactions, comments + respuestas, y $pull en
   * `User.posts`) pero para varios ids dentro de una misma sesión.
   */
  async bulkDelete(
    authorId: string,
    postIds: string[],
    session?: ClientSession,
  ): Promise<void> {
    if (postIds.length === 0) return;
    const ids = postIds.map((id) => new Types.ObjectId(id));

    const posts: any[] = await this.postDocument
      .find({ _id: { $in: ids }, author: new Types.ObjectId(authorId) })
      .select('author comments reactions reviews postType')
      .populate({ path: 'comments' })
      .session(session ?? null)
      .lean();

    const reviewIds: any[] = [];
    const reactionIds: any[] = [];
    const commentIds: any[] = [];
    const commentResponseIds: any[] = [];

    for (const post of posts) {
      if (post.postType !== PostType.petition && Array.isArray(post.reviews)) {
        reviewIds.push(...post.reviews);
      }
      if (Array.isArray(post.reactions)) {
        reactionIds.push(...post.reactions);
      }
      if (Array.isArray(post.comments)) {
        post.comments.forEach((comment: { _id: any; response: any }) => {
          commentIds.push(comment._id);
          if (comment.response) commentResponseIds.push(comment.response);
        });
      }
    }

    await this.postDocument.deleteMany(
      { _id: { $in: ids }, author: new Types.ObjectId(authorId) },
      { session },
    );

    const deletePromises: Promise<any>[] = [];
    if (reviewIds.length > 0) {
      deletePromises.push(
        this.postReviewDocument.deleteMany(
          { _id: { $in: reviewIds } },
          { session },
        ),
      );
    }
    if (reactionIds.length > 0) {
      deletePromises.push(
        this.postReactionDocument.deleteMany(
          { _id: { $in: reactionIds } },
          { session },
        ),
      );
    }
    if (commentIds.length > 0 || commentResponseIds.length > 0) {
      deletePromises.push(
        this.postCommentDocument.deleteMany(
          {
            $or: [
              { _id: { $in: commentIds } },
              { _id: { $in: commentResponseIds } },
            ],
          },
          { session },
        ),
      );
    }
    deletePromises.push(
      this.userDocument.updateOne(
        { _id: new Types.ObjectId(authorId) },
        { $pull: { posts: { $in: ids } } },
        { session },
      ),
    );

    await Promise.all(deletePromises);
    this.logger.log(
      `Bulk delete de anuncios: ${posts.length} anuncios del autor ${authorId}`,
    );
  }
}
