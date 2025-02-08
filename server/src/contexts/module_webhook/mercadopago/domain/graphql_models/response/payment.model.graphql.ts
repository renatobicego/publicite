import { ObjectType, Field, ID, Float } from "@nestjs/graphql";

@ObjectType()
export class Payment {
    @Field(() => ID)
    _id: string;

    @Field(() => String)
    mpPaymentId: string;

    @Field(() => String)
    descriptionOfPayment: string;

    @Field(() => String)
    mpPreapprovalId: string;

    @Field(() => String)
    payerId: string;

    @Field(() => String,{ nullable: true })
    payerEmail: string;

    @Field(() => String)
    paymentTypeId: string;

    @Field(() => String)
    paymentMethodId: string;

    @Field(() => Float)
    transactionAmount: number;

    @Field(() => String, { nullable: true })
    dateApproved?: string;

    @Field(() => String)
    external_reference: string;

    @Field(() => String, { nullable: true })
    status_detail: string;

    @Field(() => String)
    timeOfUpdate: string;

    @Field(() => String)
    status: string;
}
