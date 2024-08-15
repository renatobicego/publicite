/*

El tipo de dato de status es ENUM, por ahjora lo dejo como string
*/

import { Schema } from "mongoose";

export const SubscriptionSchema = new Schema({
	mpSubscriptionId: { type: String, required: true },
	mpPayerId: { type: String, required: true },
	status: { type: String, required: true },
	subscriptionPlan: { type: String, required: true },
	startDate: { type: String, required: true },
	endDate: { type: String, required: true },
})

export interface SubscriptionDocument extends Document {
	mpSubscriptionId: string;
	mpPayerId: string;
	status: string;
	subscriptionPlan: string;
	startDate: string;
	endDate: string;
}
