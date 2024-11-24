import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class backData {
    @Field(() => String, { nullable: true })
    userIdTo: string;

    @Field(() => String, { nullable: true })
    userIdFrom: string;
}


@ObjectType()
export class Notification_graph_general_schema {
    @Field(() => String)
    event: string;

    @Field(() => Boolean)
    viewed: boolean;

    @Field(() => String)
    date: string;

    @Field(() => String)
    user: string;
    @Field(() => String)
    isActionsAvailable: string;

    @Field(() => backData)
    backData: backData;
}