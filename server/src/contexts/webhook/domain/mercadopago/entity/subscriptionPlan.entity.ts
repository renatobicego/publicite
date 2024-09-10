import { ObjectId } from 'mongoose';
import { SubscriptionPlanResponse } from 'src/contexts/webhook/application/mercadopago/adapter/HTTP-RESPONSE/SubscriptionPlan.response';

export class SubscriptionPlan {
  private _id: ObjectId;
  private mpPreapprovalPlanId: string;
  private isActive: boolean;
  private reason: string;
  private description: string;
  private features: string[];
  private intervalTime: number;
  private price: number;
  private postLimit: number;

  constructor(
    mpPreapprovalPlanId: string,
    isActive: boolean,
    reason: string,
    description: string,
    features: string[],
    intervalTime: number,
    price: number,
    postLimit: number,
    _id: ObjectId,
  ) {
    this._id = _id;
    this.mpPreapprovalPlanId = mpPreapprovalPlanId;
    this.isActive = isActive;
    this.reason = reason;
    this.description = description;
    this.features = features;
    this.intervalTime = intervalTime;
    this.price = price;
    this.postLimit = postLimit;
  }

  public getId(): ObjectId {
    return this._id;
  }
  public getMpPreapprovalPlanId(): string {
    return this.mpPreapprovalPlanId;
  }
  public getDescription(): string {
    return this.description;
  }
  public getFeatures(): string[] {
    return this.features;
  }
  public getIntervalTime(): number {
    return this.intervalTime;
  }
  public getPrice(): number {
    return this.price;
  }
  public getPostLimit(): number {
    return this.postLimit;
  }
  public getIsActive(): boolean {
    return this.isActive;
  }
  public getReason(): string {
    return this.reason;
  }

  static fromDocument(doc: any): SubscriptionPlan {
    return new SubscriptionPlan(
      doc.mpPreapprovalPlanId,
      doc.isActive,
      doc.reason,
      doc.description,
      doc.features,
      doc.intervalTime,
      doc.price,
      doc.postLimit,
      doc._id ? doc._id : '',
    );
  }

  static formatEntityToResponse(
    subscriptionPlan: SubscriptionPlan,
  ): SubscriptionPlanResponse {
    return {
      _id: subscriptionPlan.getId(),
      mpPreapprovalPlanId: subscriptionPlan.getMpPreapprovalPlanId(),
      isActive: subscriptionPlan.getIsActive(),
      reason: subscriptionPlan.getReason(),
      description: subscriptionPlan.getDescription(),
      features: subscriptionPlan.getFeatures(),
      intervalTime: subscriptionPlan.getIntervalTime(),
      price: subscriptionPlan.getPrice(),
      postLimit: subscriptionPlan.getPostLimit(),
    };
  }
}
