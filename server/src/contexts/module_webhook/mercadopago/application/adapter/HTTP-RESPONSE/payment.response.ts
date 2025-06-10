import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaymentResponse {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  mpPaymentId: string;

  @Field(() => String)
  descriptionOfPayment: string

  @Field(() => String)
  mpPreapprovalId: string

  @Field(() => String)
  payerId: string;

  @Field(() => String, { nullable: true })
  payerEmail: string;

  @Field(() => String)
  paymentTypeId: string;

  @Field(() => String)
  paymentMethodId: string;

  @Field(() => String)
  transactionAmount: string;

  @Field(() => String, { nullable: true })
  dateApproved: string;

  @Field(() => String)
  external_reference: string;

  @Field(() => String)
  status_detail: string;

  @Field(() => String)
  timeOfUpdate: string;

  @Field(() => String)
  status: string;

  constructor(document: any) {
    this._id = document._id;
    this.descriptionOfPayment = document.descriptionOfPayment
    this.mpPaymentId = document.mpPaymentId;
    this.payerId = document.payerId;
    this.payerEmail = document.payerEmail;
    this.paymentTypeId = document.paymentTypeId;
    this.paymentMethodId = document.paymentMethodId;
    this.transactionAmount = document.transactionAmount;
    this.dateApproved = document.dateApproved;
    this.external_reference = document.external_reference;
    this.status_detail = document.status_detail;
    this.timeOfUpdate = document.timeOfUpdate;
    this.status = document.status;
    this.mpPreapprovalId = document.mpPreapprovalId;
  }
}
