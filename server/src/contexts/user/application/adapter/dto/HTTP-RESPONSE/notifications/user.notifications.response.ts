import { Field, ID, ObjectType } from '@nestjs/graphql';
import { front_data_GROUP } from './group/user.notification';

@ObjectType()
export class backData {
  @Field(() => String)
  userToSendId: string;
}

@ObjectType()
export class userInviting {
  @Field(() => String)
  username: string;
}

@ObjectType()
export class frontData {
  @Field(() => front_data_GROUP, { nullable: true })
  group: front_data_GROUP;

  @Field(() => userInviting)
  userInviting: userInviting;
}

@ObjectType()
export class Notification {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  event: string;

  @Field(() => Boolean)
  viewed: boolean;

  @Field(() => String)
  date: string;

  @Field(() => backData)
  backData: backData;

  @Field(() => frontData)
  frontData: frontData;

  constructor(notification: any) {
    this._id = notification._id;
    this.event = notification.event;
    this.viewed = notification.viewed;
    this.date = notification.date;
    this.backData = notification.backData;
    this.frontData = notification.frontData;
  }
}

@ObjectType()
export class GROUP_notification_graph_model_get_all {
  @Field(() => [Notification])
  notifications: Notification[];

  @Field(() => Boolean)
  hasMore: boolean;
}
