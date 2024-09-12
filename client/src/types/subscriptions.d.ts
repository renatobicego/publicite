export interface SubscriptionPlan {
  _id: ObjectId;
  reason: string;
  description: string;
  price: number;
  features: string[];
  freePlan?: boolean;
  postLimit: number;
  intervalTime: number;
  isActive: boolean;
  mpPreapprovalPlanId: string;
  isPostPack?: boolean;
}

export interface Subscription {
  _id: ObjectId;
  payerId: string;
  status: "active" | "cancelled" | "paused";
  mpPreapprovalId: string;
  startDate: string;
  endDate: string;
  subscriptionPlan: SubscriptionPlan;
  external_reference: string;
}
