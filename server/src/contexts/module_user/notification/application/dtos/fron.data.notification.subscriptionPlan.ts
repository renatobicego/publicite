import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class front_data_SUBSCRIPTIONPLAN {
    @Field(() => String)
    _id: string;

    @Field(() => String)
    reason: string;

    @Field(() => String)
    status: string;


    @Field(() => String)
    retryAttemp: string;


}