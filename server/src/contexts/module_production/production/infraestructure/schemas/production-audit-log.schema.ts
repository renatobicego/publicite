import { Document, model, Schema, Types } from 'mongoose';

import { ProductionBulkAction } from '../../domain/entity/enum/production-seudobase.enums';

export interface ProductionAuditLogDocument extends Document {
  production: Types.ObjectId;
  actor: Types.ObjectId;
  action: ProductionBulkAction;
  itemIds: Types.ObjectId[];
  affectedCount: number;
  /** JSON con los parámetros y el antes/después de la operación. */
  details: string;
  createdAt: Date;
}

/**
 * Auditoría de las operaciones masivas de la SeudoBase (SB-03): quién, qué,
 * sobre qué ítems y con qué resultado.
 */
export const ProductionAuditLogSchema = new Schema<ProductionAuditLogDocument>(
  {
    production: {
      type: Schema.Types.ObjectId,
      ref: 'Production',
      required: true,
    },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: Object.values(ProductionBulkAction),
      required: true,
    },
    itemIds: [{ type: Schema.Types.ObjectId }],
    affectedCount: { type: Number, default: 0 },
    details: { type: String, default: '{}' },
  },
  {
    collection: 'productionauditlogs',
    timestamps: { createdAt: true, updatedAt: false },
  },
);

ProductionAuditLogSchema.index({ production: 1, createdAt: -1 });

const ProductionAuditLogModel = model<ProductionAuditLogDocument>(
  'ProductionAuditLog',
  ProductionAuditLogSchema,
);

export default ProductionAuditLogModel;
