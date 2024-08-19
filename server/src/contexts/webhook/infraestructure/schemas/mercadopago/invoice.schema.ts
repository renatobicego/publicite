import { Schema } from "mongoose";
//subcription_authorized_payment
export const InvoiceSchema = new Schema({
	paymentId: { type: String, required: true },
	subscriptionId: { type: String, required: true },
	status: { type: String, required: true },
	preapprovalId: { type: String, required: true },
})

export interface InvoiceDocument extends Document {
	paymentId: string;
	subscriptionId: string;
	status: string;
	preapprovalId: string
}