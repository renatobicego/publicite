import { ObjectId } from 'mongoose';
import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class location {
  @Field(() => String)
  type: 'Point';
  @Field(() => [Float])
  coordinates: [number, number];
}

@ObjectType()
export class PostLocation_Grapql {
  @Field(() => String, { nullable: true })
  _id: ObjectId;
  @Field(() => location, { nullable: true })
  location: location;

  @Field(() => Boolean, { nullable: true })
  userSetted: boolean;
  @Field(() => String, { nullable: true })
  description: string;
}

@ObjectType()
class Visibility_post {
  @Field(() => String, { nullable: true })
  post: string;
  @Field(() => String, { nullable: true })
  socialMedia: string;
}

@ObjectType()
export class AttachedFile_post {
  @Field(() => String)
  url: string;

  @Field(() => String)
  label: string;
}

@ObjectType()
export class Post_response_graphql_model {
  @Field(() => ID, { nullable: true }) // _id puede ser nulo
  _id?: ObjectId;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => String, { nullable: true })
  postType: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => Visibility_post, { nullable: true })
  visibility: Visibility_post;

  //ver que necesitamos de esto
  //recomendations: PostRecomendation[];

  @Field(() => Float, { nullable: true })
  price: number;

  @Field(() => PostLocation_Grapql, { nullable: true })
  location: PostLocation_Grapql;

  @Field(() => [String], { nullable: true })
  category: ObjectId[];

  @Field(() => [String], { nullable: true })
  comments: ObjectId[];

  @Field(() => [AttachedFile_post], { nullable: true })
  attachedFiles?: AttachedFile_post[];

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

  @Field(() => [String], { nullable: true })
  reviews: ObjectId[];

  @Field(() => String, { nullable: true })
  condition: string;

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
