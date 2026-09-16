import { Document, model, Schema, Types } from 'mongoose';

import {
  ProductionFileType,
  ProductionItemKind,
  ProductionModerationStatus,
} from '../../domain/entity/enum/production.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

export interface ProductionItemDocument extends Document {
  production: Types.ObjectId;
  parent: Types.ObjectId | null;
  kind: ProductionItemKind;
  name: string;
  searchName: string;
  visibility: Visibility | null;
  moderationStatus: ProductionModerationStatus;
  createdBy: Types.ObjectId;
  // Sólo archivos y artículos.
  fileName?: string;
  fileType?: ProductionFileType;
  key?: string;
  postcard?: {
    latitude?: number;
    longitude?: number;
    authorship?: string;
    dedication?: string;
    description?: string;
  };
  blocks?: { type: string; data: string }[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Nodo del árbol Blog → Carpetas → Subcarpetas → Archivos (BLG-07). Carpetas,
 * archivos y artículos comparten colección con `kind` como discriminator.
 */
export const ProductionItemSchema = new Schema<ProductionItemDocument>(
  {
    production: {
      type: Schema.Types.ObjectId,
      ref: 'Production',
      required: true,
    },
    // null = raíz del blog. Sólo una carpeta puede ser padre.
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'ProductionItem',
      default: null,
    },
    name: { type: String, required: true, trim: true },
    searchName: { type: String, default: '' },
    // null = hereda del padre (VIS-03); un valor propio sobreescribe (VIS-04).
    // Mongoose no valida el enum sobre null, así que null queda permitido.
    visibility: {
      type: String,
      enum: Object.values(Visibility),
      default: null,
    },
    moderationStatus: {
      type: String,
      enum: Object.values(ProductionModerationStatus),
      default: ProductionModerationStatus.active,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    collection: 'productionitems',
    discriminatorKey: 'kind',
    timestamps: true,
  },
);

ProductionItemSchema.index({ production: 1, parent: 1 });
ProductionItemSchema.index({ production: 1, kind: 1 });
// ID `fileName` único dentro de su contenedor (BLG-13).
ProductionItemSchema.index(
  { production: 1, parent: 1, fileName: 1 },
  {
    unique: true,
    partialFilterExpression: { fileName: { $exists: true } },
    name: 'unique_fileName_per_container',
  },
);

export const ProductionFolderSchema = new Schema({});

export const ProductionFileSchema = new Schema({
  fileName: { type: String, required: true, trim: true },
  fileType: {
    type: String,
    enum: Object.values(ProductionFileType),
    required: true,
  },
  // Key de UploadThing (RNF-04). A los videos el cliente les concatena "video".
  key: { type: String, required: true },
  postcard: {
    type: new Schema(
      {
        latitude: { type: Number },
        longitude: { type: Number },
        authorship: { type: String },
        dedication: { type: String },
        description: { type: String },
      },
      { _id: false },
    ),
    default: undefined,
  },
});

export const ProductionArticleSchema = new Schema({
  fileName: { type: String, required: true, trim: true },
  // JSON de bloques de Editor.js, `data` stringificado (patrón Novelty).
  blocks: {
    type: [
      new Schema(
        {
          type: { type: String, required: true },
          data: { type: String, required: true },
        },
        { _id: false },
      ),
    ],
    default: [],
  },
});

const ProductionItemModel = model<ProductionItemDocument>(
  'ProductionItem',
  ProductionItemSchema,
);

export const PRODUCTION_ITEM_DISCRIMINATORS = [
  {
    name: 'ProductionFolder',
    schema: ProductionFolderSchema,
    value: ProductionItemKind.folder,
  },
  {
    name: 'ProductionFile',
    schema: ProductionFileSchema,
    value: ProductionItemKind.file,
  },
  {
    name: 'ProductionArticle',
    schema: ProductionArticleSchema,
    value: ProductionItemKind.article,
  },
];

export default ProductionItemModel;
