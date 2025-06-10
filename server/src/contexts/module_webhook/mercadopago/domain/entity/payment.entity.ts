import { ObjectId } from 'mongoose';

export default class Payment {
  private mpPaymentId: string;
  private mpPreapprovalId: string;
  private descriptionOfPayment: string;
  private payerId: string;
  private payerEmail: string;
  private paymentTypeId: string;
  private paymentMethodId: string;
  private transactionAmount: number;
  private dateApproved: string;
  private external_reference: string;
  private status_detail: string;
  private timeOfUpdate: string;
  private status: string;
  private _id?: ObjectId;

  constructor(
    mpPaymentId: string,
    descriptionOfPayment: string,
    mpPreapprovalId: string,
    payerId: string,
    payerEmail: string,
    paymentTypeId: string,
    paymentMethodId: string,
    transactionAmount: number,
    dateApproved: string,
    external_reference: string,
    status_detail: string,
    timeOfUpdate: string,
    status: string,
    _id?: ObjectId,
  ) {
    this.mpPaymentId = mpPaymentId ?? ' ';
    this.descriptionOfPayment = descriptionOfPayment ?? ' ';
    this.mpPreapprovalId = mpPreapprovalId ?? ' ';
    this.payerId = payerId ?? ' ';
    this.payerEmail = payerEmail ?? ' ';
    this.paymentTypeId = paymentTypeId ?? ' ';
    this.paymentMethodId = paymentMethodId ?? ' ';
    this.transactionAmount = transactionAmount ?? ' ';
    this.dateApproved = dateApproved ?? ' ';
    this.external_reference = external_reference ?? ' ';
    this.status_detail = status_detail ?? ' ';
    this.timeOfUpdate = timeOfUpdate ?? ' ';
    this.status = status ?? ' ';
    this._id = _id;
  }

  public getMPPaymentId(): string {
    return this.mpPaymentId;
  }

  public getId(): ObjectId | undefined {
    return this._id;
  }

  public getDescriptionOfPayment(): string {
    return this.descriptionOfPayment;
  }

  public getMPPreapprovalId(): string {
    return this.mpPreapprovalId;
  }

  public getStatus() {
    return this.status;
  }
  public getPayerId(): string {
    return this.payerId;
  }

  public getPayerEmail(): string {
    return this.payerEmail;
  }

  public getPaymentTypeId(): string {
    return this.paymentTypeId;
  }
  public getPaymentMethodId(): string {
    return this.paymentMethodId;
  }
  public getTransactionAmount(): number {
    return this.transactionAmount;
  }
  public getDateApproved(): string {
    return this.dateApproved;
  }

  public getExternalReference(): string {
    return this.external_reference;
  }
  public getDayOfUpdate() {
    return this.timeOfUpdate;
  }

  public getStatusDetail(): string {
    return this.status_detail;
  }
  static fromDocument(doc: any): Payment {
    return new Payment(
      doc.mpPaymentId,
      doc.descriptionOfPayment,
      doc.mpPreapprovalId,
      doc.payerId,
      doc.payerEmail,
      doc.paymentTypeId,
      doc.paymentMethodId,
      doc.transactionAmount,
      doc.dateApproved,
      doc.external_reference,
      doc.status_detail,
      doc.timeOfUpdate,
      doc.status,
      doc._id ? doc._id : ' ',
    );
  }
}
