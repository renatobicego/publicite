import { ObjectType, Field } from "@nestjs/graphql";


import { front_data_MAGAZINE } from "./front.data.notification.magazine";
import { front_data_GROUP } from "./front.data.notification.group.dto";
import { front_data_USER } from "./font.data.notification.user.dto";
import { front_data_POST } from "./front.data.notification.post.dto";
import { front_data_CONTACTSELLER } from "./front.data.notification.contactSeller";
import { front_data_SUBSCRIPTIONPLAN } from "./fron.data.notification.subscriptionPlan";
import { front_data_SHARE } from "./front.data.notification.share.dto";
import { front_data_SUBSCRIPTION } from "./front.data.notification.subscription.dto";
import { front_data_POSTCALIFICATION } from "./front.data.notification.postNotification.dto";



@ObjectType()
export class frontData {
    @Field(() => front_data_GROUP, { nullable: true })
    group: front_data_GROUP;

    @Field(() => front_data_MAGAZINE, { nullable: true })
    magazine: front_data_MAGAZINE;

    @Field(() => front_data_USER, { nullable: true })
    userRelation: front_data_USER;

    @Field(() => front_data_POST, { nullable: true })
    postActivity: front_data_POST;

    @Field(() => front_data_CONTACTSELLER, { nullable: true })
    contactSeller: front_data_CONTACTSELLER;

    @Field(() => front_data_POSTCALIFICATION, { nullable: true })
    postCalification: front_data_POSTCALIFICATION;

    @Field(() => front_data_SUBSCRIPTIONPLAN, { nullable: true })
    subscriptionPlan: front_data_SUBSCRIPTIONPLAN;

    @Field(() => front_data_SHARE, { nullable: true })
    share: front_data_SHARE;

    @Field(() => front_data_SUBSCRIPTION, { nullable: true })
    subscription: front_data_SUBSCRIPTION;


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

    @Field(() => Date)
    date: Date;

    @Field(() => String)
    user: string;

    @Field(() => Boolean)
    isActionsAvailable: boolean;

    @Field(() => backData)
    backData: backData;

    @Field(() => frontData)
    frontData: frontData;


}
@ObjectType()
export class notification_graph_model_get_all {
    @Field(() => [Notification])
    notifications: Notification[];

    @Field(() => Boolean)
    hasMore: boolean;
}
