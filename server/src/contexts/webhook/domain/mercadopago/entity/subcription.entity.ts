import { ObjectId } from 'mongoose';

//subscription_preapproval
export default class Subscription {
  private mpPreapprovalId: string;
  private payerId: string;
  private status: string;
  private subscriptionPlan: ObjectId;
  private startDate: string;
  private endDate: string;
  private _id?: ObjectId;

  constructor(
    mpPreapprovalId: string,
    payerId: string,
    status: string,
    subscriptionPlan: ObjectId,
    startDate: string,
    endDate: string,
    _id?: ObjectId,
  ) {
    this.mpPreapprovalId = mpPreapprovalId;
    this.payerId = payerId;
    this.status = status;
    this.subscriptionPlan = subscriptionPlan;
    this.startDate = startDate;
    this.endDate = endDate;
    this._id = _id;
  }

  public getMpPreapprovalId(): string {
    return this.mpPreapprovalId;
  }

  public getPayerId(): string {
    return this.payerId;
  }

  public getId(): ObjectId | undefined {
    return this._id || undefined;
  }
  public getStatus(): string {
    return this.status;
  }
  public getSubscriptionPlan(): ObjectId {
    return this.subscriptionPlan;
  }
  public getStartDate(): string {
    return this.startDate;
  }
  public getEndDate(): string {
    return this.endDate;
  }

  static fromDocument(doc: any): Subscription {
    console.log('convirtiendo sub schema a entity');
    return new Subscription(
      doc.mpPreapprovalId,
      doc.payerId,
      doc.status,
      doc.subscriptionPlan,
      doc.startDate,
      doc.endDate,
      doc._id ? doc._id : ' ',
    );
  }
}
