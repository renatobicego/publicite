import { Document, model, Schema, Types } from 'mongoose';

// --- Fans (FAN-01) -----------------------------------------------------------

export interface ProductionFanDocument extends Document {
  production: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
}

export const ProductionFanSchema = new Schema<ProductionFanDocument>(
  {
    production: {
      type: Schema.Types.ObjectId,
      ref: 'Production',
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    collection: 'productionfans',
    timestamps: { createdAt: true, updatedAt: false },
  },
);

ProductionFanSchema.index({ production: 1, user: 1 }, { unique: true });
ProductionFanSchema.index({ user: 1, createdAt: -1 });
ProductionFanSchema.index({ production: 1, createdAt: -1 });

export const ProductionFanModel = model<ProductionFanDocument>(
  'ProductionFan',
  ProductionFanSchema,
);

// --- Reseñas (REV-01/02, patrón PostReview) ------------------------------------

export interface ProductionReviewDocument extends Document {
  production: Types.ObjectId;
  author: Types.ObjectId;
  review: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export const ProductionReviewSchema = new Schema<ProductionReviewDocument>(
  {
    production: {
      type: Schema.Types.ObjectId,
      ref: 'Production',
      required: true,
    },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    review: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { collection: 'productionreviews', timestamps: true },
);

// Una reseña por usuario y producción.
ProductionReviewSchema.index({ production: 1, author: 1 }, { unique: true });
ProductionReviewSchema.index({ production: 1, createdAt: -1 });

export const ProductionReviewModel = model<ProductionReviewDocument>(
  'ProductionReview',
  ProductionReviewSchema,
);

// --- Comentarios (REV-01, patrón PostComment) ------------------------------------

export interface ProductionCommentDocument extends Document {
  production: Types.ObjectId;
  /** Archivo o artículo comentado; null = comentario del blog. */
  item: Types.ObjectId | null;
  user: Types.ObjectId;
  comment: string;
  isEdited: boolean;
  /** true si es la respuesta del staff a otro comentario. */
  isReply: boolean;
  response: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export const ProductionCommentSchema = new Schema<ProductionCommentDocument>(
  {
    production: {
      type: Schema.Types.ObjectId,
      ref: 'Production',
      required: true,
    },
    item: { type: Schema.Types.ObjectId, ref: 'ProductionItem', default: null },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    isEdited: { type: Boolean, default: false },
    isReply: { type: Boolean, default: false },
    response: {
      type: Schema.Types.ObjectId,
      ref: 'ProductionComment',
      default: null,
    },
  },
  { collection: 'productioncomments', timestamps: true },
);

ProductionCommentSchema.index({ production: 1, item: 1, isReply: 1, createdAt: -1 });

export const ProductionCommentModel = model<ProductionCommentDocument>(
  'ProductionComment',
  ProductionCommentSchema,
);
