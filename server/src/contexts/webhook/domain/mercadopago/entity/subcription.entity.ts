import { ObjectId } from "mongoose"

//subscription_preapproval
export default class Subscription {
	private mpPreapprovalId: string
	private payerId: string
	private status: string
	private subscriptionPlan: ObjectId
	private startDate: string
	private endDate: string

	constructor(mpPreapprovalId: string, payerId: string, status: string, subscriptionPlan: ObjectId, startDate: string, endDate: string) {
		this.mpPreapprovalId = mpPreapprovalId
		this.payerId = payerId
		this.status = status
		this.subscriptionPlan = subscriptionPlan
		this.startDate = startDate
		this.endDate = endDate
	}

	public getMpPreapprovalId(): string {
		return this.mpPreapprovalId
	}

	public getPayerId(): string {
		return this.payerId
	}

	static fromDocument(doc: any): Subscription {
		return new Subscription(
			doc.mpPreapprovalId,
			doc.payerId,
			doc.status,
			doc.subscriptionPlan,
			doc.startDate,
			doc.endDate
		);
	}
}