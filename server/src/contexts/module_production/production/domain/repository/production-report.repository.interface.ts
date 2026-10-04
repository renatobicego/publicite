import { ClientSession } from 'mongoose';

import {
  ProductionReportReason,
  ProductionReportStatus,
} from '../entity/enum/production-report.enums';

export interface ProductionReport {
  _id: string;
  production: string;
  item: string | null;
  reporter: string;
  reason: ProductionReportReason;
  details: string | null;
  status: ProductionReportStatus;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: Date;
}

/** Denuncias agrupadas por contenido, para el panel de revisión. */
export interface ProductionReportTargetSummary {
  production: string;
  item: string | null;
  reports: number;
  reasons: ProductionReportReason[];
  lastReportAt: Date;
}

export interface ProductionReportRepositoryInterface {
  create(
    report: Omit<
      ProductionReport,
      '_id' | 'createdAt' | 'status' | 'reviewedAt' | 'reviewedBy' | 'reviewNote'
    >,
  ): Promise<string>;
  countPending(productionId: string, itemId: string | null): Promise<number>;
  listByTarget(
    productionId: string,
    itemId: string | null,
    status?: ProductionReportStatus,
  ): Promise<ProductionReport[]>;
  listTargets(
    status: ProductionReportStatus,
    page: number,
    limit: number,
  ): Promise<{ targets: ProductionReportTargetSummary[]; total: number }>;
  /** Cierra las denuncias pendientes de un contenido con la decisión del admin. */
  resolvePending(
    productionId: string,
    itemId: string | null,
    status: ProductionReportStatus,
    adminId: string,
    note: string | null,
    session?: ClientSession,
  ): Promise<number>;
  deleteByProduction(
    productionId: string,
    session?: ClientSession,
  ): Promise<void>;
  deleteByItems(
    productionId: string,
    itemIds: string[],
    session?: ClientSession,
  ): Promise<void>;
}
