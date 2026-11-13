import { ObjectType, Field, Float } from "@nestjs/graphql";


// Regalos de planes y Hacete Amigo.
@ObjectType()
export class front_data_PLAN {
    @Field(() => String, { description: 'gift | friendGroup' })
    kind: string;

    @Field(() => String, { description: 'id del regalo o del grupo' })
    entityId: string;

    @Field(() => String, { nullable: true })
    actorName: string;

    @Field(() => String, { nullable: true })
    planReason: string;

    @Field(() => Float, { nullable: true })
    months: number;

    @Field(() => String, { nullable: true })
    reason: string;

    @Field(() => Boolean, { nullable: true })
    isPayer: boolean;
}
