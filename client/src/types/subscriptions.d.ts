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
}
