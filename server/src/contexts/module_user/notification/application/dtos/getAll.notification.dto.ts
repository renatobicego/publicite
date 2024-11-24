import { ObjectType, Field } from "@nestjs/graphql";
import { Notification_graph_general_schema } from "./notification.dto";
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
export class Notification {

    @Field(() => String)
    _id: string;

    @Field(() => Notification_graph_general_schema)
    notification: Notification_graph_general_schema;


    @Field(() => frontData)
    frontData: frontData;

    constructor(_id: string, notification: Notification_graph_general_schema, frontData: frontData) {
        this._id = _id;
        this.notification = notification;
        this.frontData = frontData;

    }
}
@ObjectType()
export class GROUP_notification_graph_model_get_all {
    @Field(() => [Notification])
    notifications: Notification[];

    @Field(() => Boolean)
    hasMore: boolean;
}
