import { ObjectId } from 'mongoose';

//subcription_authorized_payment
export default class Invoice {
  private paymentId: ObjectId | undefined;
  private subscriptionId: ObjectId | undefined;
  private status: string;
  //private mpAuthorizedPaymentId: string;
  private preapprovalId: string;
  private external_reference: string;

  constructor(
    paymentId: ObjectId | undefined,
    subscriptionId: ObjectId | undefined,
    status: string,
    preapprovalId: string,
    external_reference: string,
  ) {
    this.paymentId = paymentId;
    this.subscriptionId = subscriptionId;
    this.status = status;
    this.preapprovalId = preapprovalId;
    this.external_reference = external_reference;
  }

  getPaymentId(): ObjectId | undefined {
    return this.paymentId;
  }

  getSubscriptionId(): ObjectId | undefined {
    return this.subscriptionId;
  }

  getStatus(): string {
    return this.status;
  }
  getPreapprovalId(): string {
    return this.preapprovalId;
  }

  getExternalReference(): string {
    return this.external_reference;
  }
}
