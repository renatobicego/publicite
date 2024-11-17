import mongoose, { Schema, Types } from 'mongoose';
//subcription_authorized_payment
export const InvoiceSchema = new Schema({
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'payment',
    required: true,
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'subscription',
    required: true,
  },
  status: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  preapprovalId: { type: String, required: true },
  external_reference: { type: String, required: true },
  timeOfUpdate: { type: String },
  invoice_id: { type: String, required: true },
  transactionAmount: { type: Number, required: true },
  currencyId: { type: String, required: true },
  reason: { type: String, required: true },
  nextRetryDay: { type: String },
  retryAttempts: { type: Number },
  rejectionCode: { type: String },
});

export interface InvoiceDocument extends Document {
  paymentId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  status: string;
  paymentStatus: string;
  preapprovalId: string;
  external_reference: string;
  timeOfUpdate: string;
  invoice_id: string;
  transactionAmount: number;
  currencyId: string;
  reason: string;
  nextRetryDay: string;
  retryAttempts: number;
  rejectionCode: string;
}
