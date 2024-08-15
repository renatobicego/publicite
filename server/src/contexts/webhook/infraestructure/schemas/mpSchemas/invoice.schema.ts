import { Schema } from "mongoose";

export const invoiceSchema = new Schema({
	paymentId: { type: String, required: true },
	subscriptionId: { type: String, required: true },
})

export interface invoiceDocument extends Document {
	paymentId: string;
	subscriptionId: string;
}