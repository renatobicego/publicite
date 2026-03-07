import { Document, model, Schema } from 'mongoose';

export interface NoveltyPropertyDocument {
  key: string;
  value: string;
}

export interface NoveltyBlockDocument {
  type: string;
  data: string;
}

export interface NoveltyDocument extends Document {
  properties: NoveltyPropertyDocument[];
  blocks: NoveltyBlockDocument[];
  createdAt: Date;
  updatedAt: Date;
}

const NoveltyPropertySchema = new Schema<NoveltyPropertyDocument>(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const NoveltyBlockSchema = new Schema<NoveltyBlockDocument>(
  {
    type: { type: String, required: true },
    data: { type: String, required: true },
  },
  { _id: false },
);

const NoveltySchema = new Schema<NoveltyDocument>(
  {
    properties: {
      type: [NoveltyPropertySchema],
      required: true,
      default: [],
    },
    blocks: {
      type: [NoveltyBlockSchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'novelties',
  },
);

NoveltySchema.index({ createdAt: -1 });

const NoveltyModel = model<NoveltyDocument>('Novelty', NoveltySchema);

export { NoveltySchema, NoveltyModel };
