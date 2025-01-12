export interface SubscriptionPlan {
  _id: ObjectId;
  reason: string;
  description: string;
  price: number;
  features: string[];
  isFree?: boolean;
  intervalTime: number;
  isActive: boolean;
  mpPreapprovalPlanId: string;
  isPack: boolean;
  postsLibresCount: number;
  postsAgendaCount: number;
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

export interface PaymentSuccesNotification {
  _id: ObjectId;
  date: string;
  subscriptionPlan: Pick<SubscriptionPlan, "reason">;
}
