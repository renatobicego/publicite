/*

El tipo de dato de status es ENUM, por ahjora lo dejo como string
*/

import { Schema, Types } from "mongoose";

export const SubscriptionPlanSchema = new Schema({
	_id: { type: Types.ObjectId, default: Types.ObjectId },
	mpPreapprovalPlanId: { type: String, required: true },
	isActive: { type: Boolean, required: true },
	reason: { type: String, required: true },
	description: { type: String, required: true },
	features: { type: [String], required: true },
	intervalTime: { type: Number, required: true },
	price: { type: Number, required: true },
	postLimit: { type: Number, required: true },
})

export interface SubscriptionPlanDocument extends Document {
	_id: Types.ObjectId;
	mpPreapprovalPlanId: string;
	isActive: boolean;
	reason: string;
	description: string;
	features: string[];
	intervalTime: number;
	price: number;
	postLimit: number;
}
