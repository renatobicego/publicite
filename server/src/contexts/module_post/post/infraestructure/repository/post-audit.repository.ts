import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';

import {
  PostAuditEntry,
  PostAuditRepositoryInterface,
} from '../../domain/repository/post-audit.repository.interface';
import PostAuditLogModel, {
  PostAuditLogDocument,
} from '../schemas/post-audit-log.schema';

const toEntry = (doc: any): PostAuditEntry => ({
  _id: doc._id.toString(),
  actor: doc.actor.toString(),
  action: doc.action,
  postIds: (doc.postIds ?? []).map((id: any) => id.toString()),
  affectedCount: doc.affectedCount ?? 0,
  details: doc.details ?? '{}',
  createdAt: doc.createdAt,
});

@Injectable()
export class PostAuditRepository implements PostAuditRepositoryInterface {
  constructor(
    @InjectModel(PostAuditLogModel.modelName)
    private readonly auditModel: Model<PostAuditLogDocument>,
  ) {}

  async create(
    entry: Omit<PostAuditEntry, '_id' | 'createdAt'>,
    session?: ClientSession,
  ): Promise<string> {
    const [created] = await this.auditModel.create(
      [
        {
          ...entry,
          actor: new Types.ObjectId(entry.actor),
          postIds: entry.postIds.map((id) => new Types.ObjectId(id)),
        },
      ],
      { session },
    );
    return String(created._id);
  }

  async list(
    actorId: string,
    page: number,
    limit: number,
  ): Promise<{ entries: PostAuditEntry[]; total: number }> {
    const query = { actor: new Types.ObjectId(actorId) };
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
}
