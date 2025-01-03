import { ObjectId } from 'mongoose';
import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';
import { PostLocation_Grapql } from './post.location.graphql';



@ObjectType()
export class Contact_graph {
  @Field(() => ID, { nullable: true })
  _id?: ObjectId;
  @Field(() => String, { nullable: true })
  phone: string;
  @Field(() => String, { nullable: true })
  instagram: string;
  @Field(() => String, { nullable: true })
  facebook: string;
  @Field(() => String, { nullable: true })
  x: string;
  @Field(() => String, { nullable: true })
  website: string;
}
@ObjectType()
export class author {
  @Field(() => String)
  profilePhotoUrl: string;

  @Field(() => String)
  username: string;

  @Field(() => Contact_graph)
  contact: Contact_graph;

  @Field(() => String)
  lastName: string;

  @Field(() => String)
  name: string;
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
export class Post_Category {
  @Field(() => String, { nullable: true })
  _id: string;

  @Field(() => String, { nullable: true })
  label: string;
}

@ObjectType()
export class Post_response_graphql_model {
  @Field(() => String, { nullable: true })
  _id: ObjectId;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => String, { nullable: true })
  postType: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => Visibility_post, { nullable: true })
  visibility: Visibility_post;

  @Field(() => author, { nullable: true })
  author: author;

  @Field(() => Float, { nullable: true })
  price: number;

  @Field(() => PostLocation_Grapql, { nullable: true })
  geoLocation: PostLocation_Grapql;

  @Field(() => [Post_Category], { nullable: true })
  category: Post_Category[];

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

  @Field(() => Date, { nullable: true })
  endDate: Date;

}
