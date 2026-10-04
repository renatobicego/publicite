import { Document, model, Schema, Types } from 'mongoose';

import { PostBulkAction } from '../../domain/entity/enum/post-seudobase.enums';

export interface PostAuditLogDocument extends Document {
  actor: Types.ObjectId;
  action: PostBulkAction;
  postIds: Types.ObjectId[];
  affectedCount: number;
  /** JSON con los parámetros y el antes/después de la operación. */
  details: string;
  createdAt: Date;
}

/**
 * Auditoría de las operaciones masivas de la SeudoBase de Anuncios (SB-03):
 * quién, qué, sobre qué anuncios y con qué resultado. Espeja
 * `ProductionAuditLog` pero para el módulo Post.
 */
export const PostAuditLogSchema = new Schema<PostAuditLogDocument>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: Object.values(PostBulkAction),
      required: true,
    },
    postIds: [{ type: Schema.Types.ObjectId }],
    affectedCount: { type: Number, default: 0 },
    details: { type: String, default: '{}' },
  },
  {
    collection: 'postauditlogs',
    timestamps: { createdAt: true, updatedAt: false },
  },
);

PostAuditLogSchema.index({ actor: 1, createdAt: -1 });

const PostAuditLogModel = model<PostAuditLogDocument>(
  'PostAuditLog',
  PostAuditLogSchema,
);

export default PostAuditLogModel;
