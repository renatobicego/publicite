import mongoose, { Schema, Types } from "mongoose";
//subcription_authorized_payment
export const InvoiceSchema = new Schema({
	paymentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'payments',
		required: true
	},
	subscriptionId: { type: String, required: true },
	status: { type: String, required: true },
	preapprovalId: { type: String, required: true },
})

export interface InvoiceDocument extends Document {
	paymentId: Types.ObjectId;
	subscriptionId: string;
	status: string;
	preapprovalId: string
}