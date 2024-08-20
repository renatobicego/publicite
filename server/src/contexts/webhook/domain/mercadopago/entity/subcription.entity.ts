import { ObjectId } from "mongoose"

//subscription_preapproval
export default class Subscription {
	private mpPreapprovalId: string
	private payerId: string
	private status: string
	private subscriptionPlan: ObjectId
	private startDate: string
	private endDate: string
	private _id?: ObjectId;

	constructor(mpPreapprovalId: string, payerId: string, status: string, subscriptionPlan: ObjectId, startDate: string, endDate: string, _id?: ObjectId) {
		this.mpPreapprovalId = mpPreapprovalId
		this.payerId = payerId
		this.status = status
		this.subscriptionPlan = subscriptionPlan
		this.startDate = startDate
		this.endDate = endDate
		this._id = _id;
	}

	public getMpPreapprovalId(): string {
		return this.mpPreapprovalId
	}

	public getPayerId(): string {
		return this.payerId
	}

	public getId(): ObjectId | undefined {
		return this._id || undefined;
	}

	static fromDocument(doc: any): Subscription {
		return new Subscription(
			doc.mpPreapprovalId,
			doc.payerId,
			doc.status,
			doc.subscriptionPlan,
			doc.startDate,
			doc.endDate,
			doc._id
		);
	}
}