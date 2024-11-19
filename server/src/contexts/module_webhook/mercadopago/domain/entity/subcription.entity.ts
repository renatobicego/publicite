import { ObjectId } from 'mongoose';

import { SubscriptionResponse } from 'src/contexts/module_webhook/mercadopago/application/adapter/HTTP-RESPONSE/subscription.response';

//subscription_preapproval
export default class Subscription {
  private mpPreapprovalId: string;
  private payerId: string;
  private status: string;
  private subscriptionPlan: ObjectId;
  private startDate: string;
  private endDate: string;
  private external_reference: string;
  private timeOfUpdate: string;
  private nextPaymentDate: string;
  private paymentMethodId: string;
  private cardId: string;
  private _id?: ObjectId | null;

  constructor(
    mpPreapprovalId: string,
    payerId: string,
    status: string,
    subscriptionPlan: ObjectId,
    startDate: string,
    endDate: string,
    external_reference: string,
    timeOfUpdate: string,
    nextPaymentDate: string,
    paymentMethodId: string,
    cardId: string,
    _id?: ObjectId,
  ) {
    this.mpPreapprovalId = mpPreapprovalId;
    this.payerId = payerId;
    this.status = status;
    this.subscriptionPlan = subscriptionPlan;
    this.startDate = startDate;
    this.endDate = endDate;
    this.external_reference = external_reference;
    this.timeOfUpdate = timeOfUpdate;
    this.nextPaymentDate = nextPaymentDate;
    this.paymentMethodId = paymentMethodId;
    this.cardId = cardId;
    this._id = _id;
  }

  public getPaymentMethodId(): string {
    return this.paymentMethodId;
  }
  
  public getCardId(): string {
    return this.cardId;
  }

  public getNextPaymentDate(): string {
    return this.nextPaymentDate;
  }

  public getMpPreapprovalId(): string {
    return this.mpPreapprovalId;
  }

  public getPayerId(): string {
    return this.payerId;
  }

  public getId(): ObjectId | null {
    return this._id ?? null;
  }
  public getStatus(): string {
    return this.status;
  }
  public getSubscriptionPlan(): ObjectId {
    return this.subscriptionPlan;
  }
  public getSubscriptionPlanObject(): any {
    return this.subscriptionPlan;
  }

  public getStartDate(): string {
    return this.startDate;
  }
  public getEndDate(): string {
    return this.endDate;
  }

  public getDayOfUpdate() {
    return this.timeOfUpdate;
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
      doc.external_reference,
      doc.timeOfUpdate,
      doc.nextPaymentDate,
      doc.paymentMethodId,
      doc.cardId,
      doc._id ? doc._id : ' ',
    );
  }
  static formatEntityToResponse(
    subscription: Subscription,
  ): SubscriptionResponse {
    return {
      _id: subscription.getId() ? subscription.getId() : null,
      mpPreapprovalId: subscription.getMpPreapprovalId(),
      payerId: subscription.getPayerId(),
      status: subscription.getStatus(),
      subscriptionPlan: subscription.getSubscriptionPlanObject(),
      startDate: subscription.getStartDate(),
      endDate: subscription.getEndDate(),
      external_reference: subscription.external_reference,
      timeOfUpdate: subscription.getDayOfUpdate(),
      nextPaymentDate: subscription.getNextPaymentDate(),
      paymentMethodId: subscription.getPaymentMethodId(),
      cardId: subscription.getCardId(),
    };
  }
}