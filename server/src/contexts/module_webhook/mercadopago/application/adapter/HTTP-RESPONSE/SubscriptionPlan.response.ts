import { ObjectId } from 'mongoose';

export class SubscriptionPlanResponse {
  readonly _id: ObjectId;

  readonly mpPreapprovalPlanId: string;

  readonly isActive: boolean;

  readonly reason: string;

  readonly description: string;

  readonly features: string[];

  readonly intervalTime: number;

  readonly price: number;

  readonly isFree: boolean;

  readonly postsLibresCount: number;
  readonly postsAgendaCount: number;
  readonly isPack: boolean;

  constructor(
    _id: ObjectId,
    mpPreapprovalPlanId: string,
    isActive: boolean,
    reason: string,
    description: string,
    features: string[],
    intervalTime: number,
    price: number,
    isFree: boolean,
    postsLibresCount: number,
    postsAgendaCount: number,
    isPack: boolean,
  ) {
    this._id = _id;
    this.mpPreapprovalPlanId = mpPreapprovalPlanId;
    this.isActive = isActive;
    this.reason = reason;
    this.description = description;
    this.features = features;
    this.intervalTime = intervalTime;
    this.price = price;
    this.isFree = isFree;
    this.postsLibresCount = postsLibresCount;
    this.postsAgendaCount = postsAgendaCount;
    this.isPack = isPack;
  }
}
