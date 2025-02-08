import { ObjectType, Field, ID } from "@nestjs/graphql";

@ObjectType()
export class Subscription {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  mpPreapprovalId: string;

  @Field(() => String)
  payerId: string;

  @Field(() => String)
  status: string;

  @Field(() => String)
  subscriptionPlan: string;

  @Field(() => String)
  startDate: string;

  @Field(() => String)
  endDate: string;

  @Field(() => String)
  external_reference: string;

  @Field(() => String)
  timeOfUpdate: string;

  @Field(() => String)
  nextPaymentDate: string;

  @Field(() => String)
  paymentMethodId: string;

  @Field(() => String)
  cardId: string;
}