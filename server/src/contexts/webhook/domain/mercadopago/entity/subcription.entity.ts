
export default class Subcription {
	private mpPreapprovalId: string
	private payerId: string
	private status: string
	private subscriptionPlan: string
	private startDate: string
	private endDate: string

	constructor(mpPreapprovalId: string, payerId: string, status: string, subscriptionPlan: string, startDate: string, endDate: string) {
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

}