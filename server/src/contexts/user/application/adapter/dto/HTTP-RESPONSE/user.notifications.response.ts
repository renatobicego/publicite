import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Notifications_graphql_model {
  @Field()
  notifications: any;
}
