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
  status: "active" | "cancelled" | "paused" | "authorized";
  mpPreapprovalId: string;
  startDate: string;
  endDate: string;
  nextPaymentDate: string;
  subscriptionPlan: SubscriptionPlan;
  external_reference: string;
}

export interface Invoice {
  _id: string;
  transactionAmount: Number;
  paymentStatus: string;
  nextRetryDay: string;
  timeOfUpdate: string;
  status: string;
  reason: string;
  retryAttempts: string;
  rejectionCode: string;
  paymentId: PaymentMethod;
}

export interface PaymentMethod {
  _id: ObjectId;
  paymentMethodId: string;
  paymentTypeId: string;
  transactionAmount: number;
  timeOfUpdate: string;
  status_detail: string;
  status: string;
}

export interface PaymentNotificationType extends BaseNotification {
  frontData: {
    subscriptionPlan: {
      _id: ObjectId;
      reason: string;
      status: "pending" | "approved" | "rejected";
      retryAttemp: number;
    };
  };
}

export type PaymentStatusNotificationType =
  | "payment_pending"
  | "payment_approved"
  | "payment_rejected"
  | "subscription_cancelled"
  | "free_trial";

export interface SubscriptionNotification extends BaseNotification {
  frontData: {
    subscription: {
      event: SubscriptionEvent;
    };
  };
}

export type SubscriptionEvent =
  | "notification_downgrade_plan_contact"
  | "notification_downgrade_plan_post";
