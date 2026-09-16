import { Document, model, Schema, Types } from 'mongoose';

import {
  ProductionModerationStatus,
  ProductionOwnerType,
  ProductionShelfCategory,
} from '../../domain/entity/enum/production.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

export interface ProductionDocument extends Document {
  owner: Types.ObjectId;
  ownerType: ProductionOwnerType;
  creator: Types.ObjectId;
  title: string;
  searchTitle: string;
  description: string;
  searchDescription: string;
  headerPhotoKey: string | null;
  welcomeText: string | null;
  welcomeVideoKey: string | null;
  url: string;
  shelf: {
    category: ProductionShelfCategory;
    title: string;
    link: string;
    imageKey?: string;
  }[];
  showcase: Types.ObjectId[];
  visibility: Visibility;
  aliasCbu: string | null;
  accessKeyHash: string | null;
  accessKeyVersion: number;
  filesCount: number;
  fansCount: number;
  isFeatured: boolean;
  moderationStatus: ProductionModerationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ProductionShelfLinkSchema = new Schema(
  {
    category: {
      type: String,
      enum: Object.values(ProductionShelfCategory),
      required: true,
    },
    title: { type: String, required: true },
    link: { type: String, required: true },
    imageKey: { type: String },
  },
  { _id: false },
);

export const ProductionSchema = new Schema<ProductionDocument>(
  {
    // Dueño polimórfico (RNF-11): User o Group según ownerType.
    owner: { type: Schema.Types.ObjectId, refPath: 'ownerType', required: true },
    ownerType: {
      type: String,
      enum: Object.values(ProductionOwnerType),
      required: true,
    },
    // Usuario contra cuyo plan se evalúan los límites (GRP-08/RNF-14).
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    searchTitle: { type: String, required: true },
    description: { type: String, default: '' },
    searchDescription: { type: String, default: '' },
    headerPhotoKey: { type: String, default: null },
    welcomeText: { type: String, default: null },
    welcomeVideoKey: { type: String, default: null },
    url: { type: String, required: true, unique: true },
    shelf: { type: [ProductionShelfLinkSchema], default: [] },
    showcase: [{ type: Schema.Types.ObjectId, ref: 'ProductionItem' }],
    visibility: {
      type: String,
      enum: Object.values(Visibility),
      default: Visibility.public,
    },
    // Alias/CBU para liquidar el 90% de los tickets (RNF-10). Sólo lo ven el
    // admin del blog y los admins de la plataforma.
    aliasCbu: { type: String, default: null },
    // Hash de la clave de acceso (RNF-13). Nunca texto plano.
    accessKeyHash: { type: String, default: null },
    // Se incrementa al cambiar o quitar la clave para invalidar los accesos
    // otorgados con la clave anterior.
    accessKeyVersion: { type: Number, default: 0 },
    // Archivos + artículos del blog. Contador para validar el cupo de forma
    // atómica (PLN-05).
    filesCount: { type: Number, default: 0, min: 0 },
    fansCount: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    moderationStatus: {
      type: String,
      enum: Object.values(ProductionModerationStatus),
      default: ProductionModerationStatus.active,
    },
  },
  { collection: 'productions', timestamps: true },
);

ProductionSchema.index({ owner: 1, ownerType: 1 });
ProductionSchema.index({ creator: 1 });
ProductionSchema.index({ searchTitle: 1, searchDescription: 1 });
ProductionSchema.index({ isFeatured: -1, fansCount: -1, updatedAt: -1 });
// Un grupo tiene un único blog (Group.blog).
ProductionSchema.index(
  { owner: 1 },
  {
    unique: true,
    partialFilterExpression: { ownerType: ProductionOwnerType.Group },
    name: 'unique_group_blog',
  },
);

const ProductionModel = model<ProductionDocument>(
  'Production',
  ProductionSchema,
);

export default ProductionModel;
