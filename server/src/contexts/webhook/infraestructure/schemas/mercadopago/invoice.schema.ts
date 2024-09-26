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
});

export interface InvoiceDocument extends Document {
  paymentId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  status: string;
  paymentStatus: string;
  preapprovalId: string;
  external_reference: string;
  timeOfUpdate: string;
}
