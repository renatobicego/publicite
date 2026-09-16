import { Document, model, Schema, Types } from 'mongoose';

import {
  ProductionPayoutStatus,
  ProductionTicketPurchaseStatus,
} from '../../domain/entity/enum/production-ticket.enums';

export interface ProductionTicketPurchaseDocument extends Document {
  ticket: Types.ObjectId;
  production: Types.ObjectId;
  target: Types.ObjectId | null;
  buyer: Types.ObjectId;
  creator: Types.ObjectId;
  status: ProductionTicketPurchaseStatus;
  isOpen: boolean;
  isPaid: boolean;
  amount: number;
  currency: string;
  commissionPercent: number;
  commissionAmount: number;
  creatorPayoutAmount: number;
  durationHours: number | null;
  untilClose: boolean;
  filesCount: number;
  productionTitle: string;
  targetName: string | null;
  payoutAliasCbu: string | null;
  acceptedNoRefund: boolean;
  acceptedAt: Date | null;
  transferReference: string | null;
  confirmedAt: Date | null;
  confirmedBy: string | null;
  activatedAt: Date | null;
  activatedBy: string | null;
  expiresAt: Date | null;
  expiredAt: Date | null;
  rejectedAt: Date | null;
  rejectedBy: string | null;
  statusReason: string | null;
  facturaUrl: string | null;
  facturaUploadedAt: Date | null;
  facturaUploadedBy: string | null;
  payoutStatus: ProductionPayoutStatus;
  payoutAt: Date | null;
  payoutBy: string | null;
  reviewRequired: boolean;
  firstAccessAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Compra de un ticket (TKT-04..08, RNF-07). Patrón invoice: el pago es por
 * transferencia y un admin lo confirma. Guarda una copia de los datos del
 * ticket y del blog para que el registro contable sobreviva al borrado.
 */
export const ProductionTicketPurchaseSchema =
  new Schema<ProductionTicketPurchaseDocument>(
    {
      ticket: {
        type: Schema.Types.ObjectId,
        ref: 'ProductionTicket',
        required: true,
      },
      production: {
        type: Schema.Types.ObjectId,
        ref: 'Production',
        required: true,
      },
      target: { type: Schema.Types.ObjectId, default: null },
      buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      // Quien cobra: el creator del blog (GRP-05).
      creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      status: {
        type: String,
        enum: Object.values(ProductionTicketPurchaseStatus),
        required: true,
      },
      // true mientras la compra está pending/confirmed/active: evita duplicados.
      isOpen: { type: Boolean, required: true },
      isPaid: { type: Boolean, required: true },
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'ARS' },
      commissionPercent: { type: Number, default: 0 },
      commissionAmount: { type: Number, default: 0 },
      creatorPayoutAmount: { type: Number, default: 0 },
      durationHours: { type: Number, default: null },
      untilClose: { type: Boolean, default: false },
      filesCount: { type: Number, default: 0 },
      productionTitle: { type: String, required: true },
      targetName: { type: String, default: null },
      payoutAliasCbu: { type: String, default: null },
      acceptedNoRefund: { type: Boolean, default: false },
      acceptedAt: { type: Date, default: null },
      transferReference: { type: String, default: null },
      confirmedAt: { type: Date, default: null },
      confirmedBy: { type: String, default: null },
      activatedAt: { type: Date, default: null },
      activatedBy: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      expiredAt: { type: Date, default: null },
      rejectedAt: { type: Date, default: null },
      rejectedBy: { type: String, default: null },
      statusReason: { type: String, default: null },
      // Factura del 10% que carga un admin (TKT-06, patrón attachFactura).
      facturaUrl: { type: String, default: null },
      facturaUploadedAt: { type: Date, default: null },
      facturaUploadedBy: { type: String, default: null },
      payoutStatus: {
        type: String,
        enum: Object.values(ProductionPayoutStatus),
        default: ProductionPayoutStatus.notApplicable,
      },
      payoutAt: { type: Date, default: null },
      payoutBy: { type: String, default: null },
      // Reseña obligatoria de los tickets pagos (TKT-09, REV-02).
      reviewRequired: { type: Boolean, default: false },
      firstAccessAt: { type: Date, default: null },
      reviewedAt: { type: Date, default: null },
    },
    { collection: 'productionticketpurchases', timestamps: true },
  );

ProductionTicketPurchaseSchema.index(
  { ticket: 1, buyer: 1 },
  {
    unique: true,
    partialFilterExpression: { isOpen: true },
    name: 'unique_open_purchase_per_buyer',
  },
);
ProductionTicketPurchaseSchema.index({ buyer: 1, production: 1, status: 1 });
ProductionTicketPurchaseSchema.index({ production: 1, status: 1, createdAt: -1 });
ProductionTicketPurchaseSchema.index({ status: 1, expiresAt: 1 });
ProductionTicketPurchaseSchema.index({ createdAt: -1 });

const ProductionTicketPurchaseModel = model<ProductionTicketPurchaseDocument>(
  'ProductionTicketPurchase',
  ProductionTicketPurchaseSchema,
);

export default ProductionTicketPurchaseModel;
