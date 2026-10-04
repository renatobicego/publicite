import { ClientSession } from 'mongoose';

import { ProductionBulkAction } from '../entity/enum/production-seudobase.enums';

export interface ProductionAuditEntry {
  _id: string;
  production: string;
  actor: string;
  action: ProductionBulkAction;
  itemIds: string[];
  affectedCount: number;
  details: string;
  createdAt: Date;
}

export interface ProductionAuditRepositoryInterface {
  create(
    entry: Omit<ProductionAuditEntry, '_id' | 'createdAt'>,
    session?: ClientSession,
  ): Promise<string>;
  list(
    productionId: string,
    page: number,
    limit: number,
  ): Promise<{ entries: ProductionAuditEntry[]; total: number }>;
  deleteByProduction(
    productionId: string,
    session?: ClientSession,
  ): Promise<void>;
}
