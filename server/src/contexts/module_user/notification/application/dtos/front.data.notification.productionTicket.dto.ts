import { ObjectType, Field, Float } from "@nestjs/graphql";


@ObjectType()
export class front_data_PRODUCTIONTICKET {
    @Field(() => String, { description: 'buyer | staff | admin' })
    audience: string;

    @Field(() => String)
    purchaseId: string;

    @Field(() => String)
    productionId: string;

    @Field(() => String)
    productionTitle: string;

    @Field(() => String, { nullable: true })
    targetId: string;

    @Field(() => String, { nullable: true })
    targetName: string;

    @Field(() => Float, { nullable: true })
    amount: number;

    @Field(() => String, { nullable: true })
    currency: string;

    @Field(() => Float, { nullable: true })
    creatorPayoutAmount: number;

    @Field(() => Float, { nullable: true })
    commissionAmount: number;

    @Field(() => String, { nullable: true })
    reason: string;
}
