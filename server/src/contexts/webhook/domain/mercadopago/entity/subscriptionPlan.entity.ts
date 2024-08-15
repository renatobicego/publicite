export class SubscriptionPlan {
	private mpPreapprovalPlanId: string;
	private isActive: boolean;
	private reason: string;
	private description: string;
	private features: string[];
	private intervalTime: number;
	private price: number;
	private postLimit: number;

	constructor(mpPreapprovalPlanId: string, isActive: boolean, reason: string, description: string, features: string[], intervalTime: number, price: number, postLimit: number) {
		this.mpPreapprovalPlanId = mpPreapprovalPlanId;
		this.isActive = isActive;
		this.reason = reason;
		this.description = description;
		this.features = features;
		this.intervalTime = intervalTime;
		this.price = price;
		this.postLimit = postLimit;
	}
}