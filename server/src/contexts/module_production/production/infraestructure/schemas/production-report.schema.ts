import { Document, model, Schema, Types } from 'mongoose';

import {
  ProductionReportReason,
  ProductionReportStatus,
} from '../../domain/entity/enum/production-report.enums';

export interface ProductionReportDocument extends Document {
  production: Types.ObjectId;
  /** Archivo, artículo o carpeta denunciado; null = el blog. */
  item: Types.ObjectId | null;
  reporter: Types.ObjectId;
  reason: ProductionReportReason;
  details: string | null;
  status: ProductionReportStatus;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Denuncia de contenido UGC (DEN-01..03). */
export const ProductionReportSchema = new Schema<ProductionReportDocument>(
  {
    production: {
      type: Schema.Types.ObjectId,
      ref: 'Production',
      required: true,
    },
    item: { type: Schema.Types.ObjectId, ref: 'ProductionItem', default: null },
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      enum: Object.values(ProductionReportReason),
      required: true,
    },
    details: { type: String, default: null },
    status: {
      type: String,
      enum: Object.values(ProductionReportStatus),
      default: ProductionReportStatus.pending,
    },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: null },
    reviewNote: { type: String, default: null },
  },
  { collection: 'productionreports', timestamps: true },
);

// Una denuncia abierta por usuario y contenido.
ProductionReportSchema.index(
  { production: 1, item: 1, reporter: 1 },
  {
    unique: true,
    partialFilterExpression: { status: ProductionReportStatus.pending },
    name: 'unique_pending_report_per_reporter',
  },
);
ProductionReportSchema.index({ status: 1, createdAt: -1 });
ProductionReportSchema.index({ production: 1, item: 1, status: 1 });

const ProductionReportModel = model<ProductionReportDocument>(
  'ProductionReport',
  ProductionReportSchema,
);

export default ProductionReportModel;
