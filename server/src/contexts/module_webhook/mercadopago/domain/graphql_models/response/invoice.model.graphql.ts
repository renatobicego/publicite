import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';


import { Payment } from './payment.model.graphql';
import { Subscription } from './subscription.model.graphql';




@ObjectType()
export class Invoice {
  @Field(() => ID)
  _id: string;

  @Field(() => Payment, { nullable: true })
  paymentId: Payment;

  @Field(() => Subscription)
  subscriptionId: Subscription;

  @Field(() => String)
  status: string;

  @Field(() => String)
  paymentStatus: string;

  @Field(() => String)
  preapprovalId: string;

  @Field(() => String)
  external_reference: string;

  @Field(() => String)
  timeOfUpdate: string;

  @Field(() => String)
  invoice_id: string;

  @Field(() => Float)
  transactionAmount: number;

  @Field(() => String, { nullable: true })
  currencyId: string;

  @Field(() => String)
  reason: string;

  @Field(() => String)
  nextRetryDay: string;

  @Field(() => Int)
  retryAttempts: number;

  @Field(() => String, { nullable: true })
  rejectionCode: string;
}




@ObjectType()
export class InvoiceGetAllResponse {
  @Field(() => [Invoice], { nullable: true })
  invoices: Invoice[];

  @Field(() => Boolean)
  hasMore: boolean;
}