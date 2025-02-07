import { ObjectType, Field } from "@nestjs/graphql";


@ObjectType()
export class front_data_SUBSCRIPTION {
    @Field(() => String)
    event: string;



}