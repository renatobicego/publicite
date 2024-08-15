import mongoose, { Schema, Types } from "mongoose";


export const SubscriptionSchema = new Schema({
	mpPreapprovalId: { type: String, required: true },
	payerId: { type: String, required: true },
	status: { type: String, required: true },
	subscriptionPlan: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'SubscriptionPlan',
		required: true
	},
	startDate: { type: String, required: true },
	endDate: { type: String, required: true },
})


export interface SubscriptionDocument extends Document {
	mpPreapprovalId: string;
	payerId: string;
	status: string;
	subscriptionPlan: Types.ObjectId;
	startDate: string;
	endDate: string;
}