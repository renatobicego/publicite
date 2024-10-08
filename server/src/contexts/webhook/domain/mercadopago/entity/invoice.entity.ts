import { ObjectId } from 'mongoose';

//subcription_authorized_payment
export default class Invoice {
  private paymentId: ObjectId | string;
  private subscriptionId: ObjectId | undefined;
  private status: string;
  private paymentStatus: string;
  private preapprovalId: string;
  private external_reference: string;
  private timeOfUpdate: string;
  private invoice_id: string;

  constructor(
    paymentId: ObjectId | string,
    subscriptionId: ObjectId | undefined,
    status: string,
    paymentStatus: string,
    preapprovalId: string,
    external_reference: string,
    timeOfUpdate: string,
    invoice_id: string,
  ) {
    this.paymentId = paymentId;
    this.subscriptionId = subscriptionId;
    this.status = status;
    this.paymentStatus = paymentStatus;
    this.preapprovalId = preapprovalId;
    this.external_reference = external_reference;
    this.timeOfUpdate = timeOfUpdate;
    this.invoice_id = invoice_id;
  }

  getPaymentId() {
    return this.paymentId;
  }

  getInvoiceId() {
    return this.invoice_id;
  }

  getPaymentStatus(): string {
    return this.paymentStatus;
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
  getDayOfUpdate() {
    return this.timeOfUpdate;
  }
}
