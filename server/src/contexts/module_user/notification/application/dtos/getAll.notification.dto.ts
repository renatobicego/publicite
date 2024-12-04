import { ObjectType, Field } from "@nestjs/graphql";


import { front_data_MAGAZINE } from "./front.data.notification.magazine";
import { front_data_GROUP } from "./front.data.notification.group.dto";



@ObjectType()
export class frontData {
    @Field(() => front_data_GROUP, { nullable: true })
    group: front_data_GROUP;

    @Field(() => front_data_MAGAZINE, { nullable: true })
    magazine: front_data_MAGAZINE;
}

@ObjectType()
export class backData {
    @Field(() => String, { nullable: true })
    userIdTo: string;

    @Field(() => String, { nullable: true })
    userIdFrom: string;
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

    @Field(() => Boolean)
    isActionsAvailable: boolean;

    @Field(() => backData)
    backData: backData;

    @Field(() => frontData)
    frontData: frontData;

    constructor(_id: string, event: string, viewed: boolean, date: string, user: string, isActionsAvailable: boolean, backData: backData, frontData: frontData) {
        this._id = _id;
        this.event = event;
        this.viewed = viewed;
        this.date = date;
        this.user = user;
        this.isActionsAvailable = isActionsAvailable;
        this.backData = backData;
        this.frontData = frontData
    }
}
@ObjectType()
export class GROUP_notification_graph_model_get_all {
    @Field(() => [Notification])
    notifications: Notification[];

    @Field(() => Boolean)
    hasMore: boolean;
}
