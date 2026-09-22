import { ClientSession } from 'mongoose';

import { PostBulkAction } from '../entity/enum/post-seudobase.enums';

export interface PostAuditEntry {
  _id: string;
  actor: string;
  action: PostBulkAction;
  postIds: string[];
  affectedCount: number;
  details: string;
  createdAt: Date;
}

export interface PostAuditRepositoryInterface {
  create(
    entry: Omit<PostAuditEntry, '_id' | 'createdAt'>,
    session?: ClientSession,
  ): Promise<string>;
  list(
    actorId: string,
    page: number,
    limit: number,
  ): Promise<{ entries: PostAuditEntry[]; total: number }>;
}
