import { Field, ObjectType, ID } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Board } from 'src/contexts/module_user/board/domain/entity/board.entity';
import { Contact } from 'src/contexts/module_user/contact/domain/entity/contact.entity';
import { Post_Full_Graphql_Model } from 'src/contexts/module_post/post/domain/entity/models_graphql/post.full.grapql.model';

@ObjectType()
export class Subscriptions_Full_Graphql_Model {
  @Field(() => ID)
  _id: string;

  @Field(() => String, { nullable: true })
  mpPreapprovalId: string;

  @Field(() => String, { nullable: true })
  payerId: string;

  @Field(() => String, { nullable: true })
  status: string;

  @Field(() => String, { nullable: true })
  subscriptionPlan: string;

  @Field(() => String, { nullable: true })
  startDate: string;

  @Field(() => String, { nullable: true })
  endDate: string;

  @Field(() => String, { nullable: true })
  external_reference: string;

  @Field(() => String, { nullable: true })
  timeOfUpdate?: string;
}

@ObjectType()
export class Post_full_Graph {
  @Field(() => ID, { nullable: true })
  _id?: ObjectId;

  @Field(() => [String], { nullable: true })
  imagesUrls: string[];
}
@ObjectType()
export class Groups_Full_Graphql_Model {
  @Field(() => ID, { nullable: true })
  _id?: ObjectId;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => [String], { nullable: true })
  members: ObjectId[];

  @Field(() => [String], { nullable: true })
  admins: ObjectId[];

  @Field(() => String, { nullable: true })
  profilePhotoUrl: string;
}

@ObjectType()
export class Sections_Full_Graphql_Model {
  @Field(() => ID, { nullable: true })
  _id?: ObjectId;

  @Field(() => [Post_full_Graph], { nullable: true })
  posts: Post_full_Graph[];
}

@ObjectType()
export class Magazines_Full_Graphql_Model {
  @Field(() => ID, { nullable: true })
  _id?: ObjectId;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => [Sections_Full_Graphql_Model], { nullable: true })
  sections: Sections_Full_Graphql_Model[];

  @Field(() => String, { nullable: true })
  description: string;
}

@ObjectType()
class BackData_user_notification {
  @Field(() => String)
  userIdTo: string;

  @Field(() => String)
  userIdFrom: string;
}

@ObjectType()
class UserFrom {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  username: string;

  @Field(() => String)
  profilePhotoUrl: string;
}

@ObjectType()
class UserRelation {
  @Field(() => ID, { nullable: true })
  _id: string;

  @Field(() => UserFrom)
  userFrom: UserFrom;

  @Field(() => String)
  typeRelation: string;
}

@ObjectType()
class FrontData_user_notification {
  @Field(() => UserRelation)
  userRelation: UserRelation;
}

@ObjectType()
class friendRequests {
  @Field(() => ID)
  _id: ObjectId;

  @Field(() => String)
  event: string;

  @Field(() => Boolean)
  viewed: boolean;

  @Field(() => String)
  date: string;

  @Field(() => String)
  user: string;

  @Field(() => BackData_user_notification)
  backData: BackData_user_notification;

  @Field(() => FrontData_user_notification)
  frontData: FrontData_user_notification;
}
@ObjectType()
@ObjectType()
class user_user_relation {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  userType: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String, { nullable: true })
  businessName: string;

  @Field(() => String)
  profilePhotoUrl: string;

  @Field(() => String)
  username: string;
}
@ObjectType()
class user_relation {
  @Field(() => ID)
  _id: string;

  @Field(() => user_user_relation)
  userA: user_user_relation;

  @Field(() => user_user_relation)
  userB: user_user_relation;

  @Field(() => String)
  typeRelationA: string;

  @Field(() => String)
  typeRelationB: string;
}
@ObjectType()
export class User_Full_Grapql_Model {
  @Field(() => ID, { nullable: true })
  _id?: ObjectId;

  @Field(() => String, { nullable: true })
  clerkId: string;

  @Field(() => String, { nullable: true })
  email: string;
  @Field(() => String, { nullable: true })
  username: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => String, { nullable: true })
  profilePhotoUrl: string;

  @Field(() => String, { nullable: true })
  countryRegion: string;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  lastName: string;

  @Field(() => String, { nullable: true })
  isActive: boolean;

  @Field(() => String, { nullable: true })
  businessName?: string;

  @Field(() => Contact, { nullable: true })
  contact?: Contact;

  @Field(() => String, { nullable: true })
  createdTime?: string;

  @Field(() => [Magazines_Full_Graphql_Model], { nullable: 'itemsAndList' })
  magazines?: Magazines_Full_Graphql_Model[];

  @Field(() => Board, { nullable: true })
  board?: Board;

  @Field(() => [Post_Full_Graphql_Model], { nullable: 'itemsAndList' })
  posts?: Post_Full_Graphql_Model;

  @Field(() => [Subscriptions_Full_Graphql_Model], { nullable: 'itemsAndList' })
  subscriptions?: Subscriptions_Full_Graphql_Model[];

  @Field(() => [user_relation], { nullable: true })
  userRelations: user_relation[] = [];
  @Field(() => String, { nullable: true })
  userType?: string;

  @Field(() => [Groups_Full_Graphql_Model], { nullable: 'itemsAndList' })
  groups?: Groups_Full_Graphql_Model[];

  @Field(() => [friendRequests], { nullable: true })
  friendRequests?: friendRequests[];

  @Field(() => Boolean, { nullable: true })
  isFriendRequestPending?: boolean;


}
