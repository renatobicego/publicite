import { Schema } from "mongoose";

export const PaymentSchema = new Schema({
	mpPaymentId: { type: String, required: true },
	mpPayerId: { type: String, required: true },
	mpPayerEmail: { type: String, required: true },
	paymentMethod: { type: String, required: true },
	transactionAmount: { type: Number, required: true },
	date: { type: String, required: true },

})


export interface PaymentDocument extends Document {
	mpPaymentId: string;
	mpPayerId: string;
	mpPayerEmail: string;
	paymentMethod: string;
	transactionAmount: number;
	date: string;
}