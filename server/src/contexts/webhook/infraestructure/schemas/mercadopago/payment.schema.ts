import { Schema } from 'mongoose';

export const PaymentSchema = new Schema({
  mpPaymentId: { type: String, required: true },
  payerId: { type: String, required: true },
  payerEmail: { type: String, required: true },
  paymentTypeId: { type: String, required: true },
  paymentMethodId: { type: String, required: true },
  transactionAmount: { type: Number, required: true },
  dateApproved: { type: String, required: true },
  external_reference: { type: String, required: true },
  status_detail: { type: String, required: true },
  dayOfUpdate: { type: String },
  status: { type: String },
});

export interface PaymentDocument extends Document {
  mpPaymentId: string;
  payerId: string;
  payerEmail: string;
  paymentTypeId: string;
  paymentMethodId: string;
  transactionAmount: number;
  dateApproved: string;
  external_reference: string;
  status_detail: string;
  dayOfUpdate: string;
  status: string;
}
