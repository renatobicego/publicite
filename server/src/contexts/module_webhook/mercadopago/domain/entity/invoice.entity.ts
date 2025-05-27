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

  private transactionAmount: number;
  private currencyId: string;
  private reason: string;
  private nextRetryDay: string;
  private retryAttempts: number;
  private rejectionCode: string;
  constructor(
    paymentId: ObjectId | string,
    subscriptionId: ObjectId | undefined,
    status: string,
    paymentStatus: string,
    preapprovalId: string,
    external_reference: string,
    timeOfUpdate: string,
    invoice_id: string,
    transactionAmount: number,
    currencyId: string,
    reason: string,
    nextRetryDay: string,
    retryAttempts: number,
    rejectionCode: string

  ) {
    this.paymentId = paymentId;
    this.subscriptionId = subscriptionId;
    this.status = status;
    this.paymentStatus = paymentStatus;
    this.preapprovalId = preapprovalId;
    this.external_reference = external_reference;
    this.timeOfUpdate = timeOfUpdate;
    this.invoice_id = invoice_id;
    this.transactionAmount = transactionAmount;
    this.currencyId = currencyId;
    this.reason = reason;
    this.nextRetryDay = nextRetryDay;
    this.retryAttempts = retryAttempts;
    this.rejectionCode = rejectionCode
  }

  getRejectionCode(): string {
    return this.rejectionCode;
  }

  getRetryAttempts(): number {
    return this.retryAttempts;
  }

  getNextRetryDay(): string {
    return this.nextRetryDay;
  }

  getReason(): string {
    return this.reason;
  }

  getCurrencyId(): string {
    return this.currencyId;
  }

  getPaymentId() {
    return this.paymentId;
  }

  getTransactionAmount() {
    return this.transactionAmount;
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
