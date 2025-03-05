import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class GroupExitRequest {

    @Field(() => String)
    groupId: string;

    @Field(() => String, { nullable: true })
    member?: string;

    @Field(() => String, { nullable: true })
    creator?: string;

    @Field(() => String, { nullable: true })
    newCreator?: string;

}


