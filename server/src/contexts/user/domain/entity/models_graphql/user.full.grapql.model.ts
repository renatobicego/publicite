import { Field, ObjectType, ID, Float } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Board } from 'src/contexts/board/domain/entity/board.entity';
import { Contact } from 'src/contexts/contact/domain/entity/contact.entity';
import { Post_Full_Graphql_Model } from 'src/contexts/post/domain/entity/models_graphql/post.full.grapql.model';

@ObjectType()
export class UserPreferences_Grapql_Model {
  @Field(() => [ID], { nullable: true })
  searchPreference: ObjectId[] | [];

  @Field(() => Float, { nullable: true })
  backgroundColor: number | undefined;
}

@ObjectType()
export class User_Full_Grapql_Model {
  @Field(() => ID, { nullable: true }) // _id puede ser nulo
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

  // @Field(() => [ID], { nullable: 'itemsAndList' })
  // subscriptions?: ObjectId[];

  // @Field(() => [ID], { nullable: 'itemsAndList' })
  // groups?: ObjectId[];

  // @Field(() => [ID], { nullable: 'itemsAndList' })
  // magazines?: ObjectId[];

  @Field(() => Board, { nullable: true })
  board?: Board;

  @Field(() => [Post_Full_Graphql_Model], { nullable: 'itemsAndList' })
  post?: Post_Full_Graphql_Model;

  // @Field(() => [ID], { nullable: 'itemsAndList' })
  // userRelations?: ObjectId[];

  @Field(() => String, { nullable: true })
  userType?: string;

  @Field(() => UserPreferences_Grapql_Model, { nullable: true })
  userPreferences?: UserPreferences_Grapql_Model;
}
