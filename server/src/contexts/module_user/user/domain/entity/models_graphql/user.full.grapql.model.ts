import { Field, ObjectType, ID, Float } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Board } from 'src/contexts/module_user/board/domain/entity/board.entity';
import { Contact } from 'src/contexts/module_user/contact/domain/entity/contact.entity';
import { Post_Full_Graphql_Model } from 'src/contexts/module_post/post/domain/post/entity/models_graphql/post.full.grapql.model';

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

  // @Field(() => [ID], { nullable: 'itemsAndList' })
  // userRelations?: ObjectId[];

  @Field(() => String, { nullable: true })
  userType?: string;

  @Field(() => [Groups_Full_Graphql_Model], { nullable: 'itemsAndList' })
  groups?: Groups_Full_Graphql_Model[];
}
