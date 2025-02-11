import { ObjectId } from 'mongoose';
import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';
import { GoodCondition } from '../enum/post-good-condition.enum';
import { PostLocation_Grapql } from './HTTP-RESPONSE/post.location.graphql';

@ObjectType()
class Visibility {
  @Field(() => String, { nullable: true })
  post: string;
  @Field(() => String, { nullable: true })
  socialMedia: string;
}

@ObjectType()
export class AttachedFile {
  @Field(() => String)
  url: string;

  @Field(() => String)
  label: string;
}

@ObjectType()
class review_get_user {
  @Field(() => String, { nullable: true })
  _id: string;

  @Field(() => String, { nullable: true })
  author: string;

  @Field(() => String, { nullable: true })
  review: string;

  @Field(() => Date, { nullable: true })
  date: Date;

  @Field(() => Float, { nullable: true })
  rating: number;
}

@ObjectType()
export class Post_Full_Graphql_Model {
  @Field(() => ID, { nullable: true }) // _id puede ser nulo
  _id?: ObjectId;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => String, { nullable: true })
  postType: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => Visibility, { nullable: true })
  visibility: Visibility;
  //ver que necesitamos de esto
  //recomendations: PostRecomendation[];
  @Field(() => Float, { nullable: true })
  price: number;

  @Field(() => PostLocation_Grapql, { nullable: true })
  geoLocation: PostLocation_Grapql;

  @Field(() => [String], { nullable: true })
  category: ObjectId[];

  @Field(() => [String], { nullable: true })
  comments: ObjectId[];

  @Field(() => [AttachedFile], { nullable: true })
  attachedFiles?: AttachedFile[];

  @Field(() => String, { nullable: true })
  createAt: string;

  //Fields post GOOD
  @Field(() => [String], { nullable: true })
  imagesUrls: string[];

  @Field(() => Int, { nullable: true })
  year: number;

  @Field(() => String, { nullable: true })
  brand: string;

  @Field(() => String, { nullable: true })
  modelType: string;

  @Field(() => [review_get_user], { nullable: true })
  reviews: review_get_user[];

  @Field(() => GoodCondition, { nullable: true })
  condition: GoodCondition;

  @Field(() => Date, { nullable: true })
  endDate: Date;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => String)
  postBehaviourType: string;
  //Fields post Service
  //-> comparte imagesUrls & reviews de post good & frequencyPrice de post petition
  @Field(() => String, { nullable: true })
  frequencyPrice: string;

  //Fields post Petition
  @Field(() => Float, { nullable: true })
  toPrice: number;

  @Field(() => String, { nullable: true })
  petitionType: string;
}
