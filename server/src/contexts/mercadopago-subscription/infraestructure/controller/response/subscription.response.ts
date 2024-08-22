import { ObjectId } from "mongoose";

export interface SubscriptionResponse{
	mpPreapprovalId: string;
	payerId: string;
	status: string;
	subscriptionPlan: ObjectId;
	startDate: string;
	endDate: string;
}