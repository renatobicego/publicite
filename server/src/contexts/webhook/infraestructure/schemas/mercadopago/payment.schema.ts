import { ObjectId, Schema, Types } from "mongoose";

export const PaymentSchema = new Schema({
	mpPaymentId: { type: String, required: true },
	payerId: { type: String, required: true },
	payerEmail: { type: String, required: true },
	paymentTypeId: { type: String, required: true },
	paymentMethodId: { type: String, required: true },
	transactionAmount: { type: Number, required: true },
	dateApproved: { type: String, required: true },
	_id: { type: Types.ObjectId, default: undefined, required: false },
})


export interface PaymentDocument extends Document {
	mpPaymentId: string;
	payerId: string;
	payerEmail: string;
	paymentTypeId: string;
	paymentMethodId: string;
	transactionAmount: number;
	dateApproved: string;
	_id?: ObjectId; 

}
