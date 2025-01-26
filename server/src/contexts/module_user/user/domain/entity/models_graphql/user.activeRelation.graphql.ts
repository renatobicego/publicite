import { ObjectType, Field, ID } from "@nestjs/graphql";

@ObjectType()
export class user_active_relation {
    @Field(() => ID, { nullable: true })
    _id: string;

    @Field(() => String)
    userA: String;

    @Field(() => String)
    userB: String;

    @Field(() => String)
    typeRelationA: string;

    @Field(() => String)
    typeRelationB: string;
}