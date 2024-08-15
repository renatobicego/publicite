import { Schema } from "mongoose";

export const InvoiceSchema = new Schema({
	paymentId: { type: String, required: true },
	subscriptionId: { type: String, required: true },
	status: { type: String, required: true },
	mpAuthorizedPaymentId: { type: String, required: true },
})

export interface InvoiceDocument extends Document {
	paymentId: string;
	subscriptionId: string;
	status: string;
	mpAuthorizedPaymentId: string
}