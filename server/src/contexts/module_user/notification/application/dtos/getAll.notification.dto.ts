import { ObjectType, Field } from "@nestjs/graphql";
import { front_data_GROUP } from "./user.notification";


@ObjectType()
export class backData {
    @Field(() => String, { nullable: true })
    userIdTo: string;

    @Field(() => String, { nullable: true })
    userIdFrom: string;
}

@ObjectType()
export class userInviting {
    @Field(() => String)
    username: string;
    @Field(() => String, { nullable: true })
    _id: string;
}

@ObjectType()
export class groupInviting {
    @Field(() => String)
    name: string;

    @Field(() => String, { nullable: true })
    _id: string;
}


@ObjectType()
export class magazineNotification {
    @Field(() => String)
    _id: string;

    @Field(() => String)
    name: string;

    @Field(() => String)
    ownerType: string;

    @Field(() => userInviting, { nullable: true })
    userInviting: userInviting;

    @Field(() => groupInviting, { nullable: true })
    groupInviting: groupInviting;




}

@ObjectType()
export class frontData {
    @Field(() => front_data_GROUP, { nullable: true })
    group: front_data_GROUP;

    @Field(() => userInviting, { nullable: true })
    userInviting: userInviting;

    @Field(() => magazineNotification, { nullable: true })
    magazine: magazineNotification;


}

@ObjectType()
export class Notification {
    @Field(() => String)
    _id: string;

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

    @Field(() => backData, { nullable: true })
    backData: backData;

    @Field(() => frontData)
    frontData: frontData;


}

@ObjectType()
export class GROUP_notification_graph_model_get_all {
    @Field(() => [Notification])
    notifications: Notification[];

    @Field(() => Boolean)
    hasMore: boolean;
}