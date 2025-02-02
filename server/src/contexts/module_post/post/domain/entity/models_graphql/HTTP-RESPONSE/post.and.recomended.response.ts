import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Post_response_graphql_model } from './post.response.graphql';

@ObjectType()
class post_response_recomended {
  @Field(() => String, { nullable: true })
  _id: string;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => String, { nullable: true })
  postType: string;

  @Field(() => String, { nullable: true })
  price: string;

  @Field(() => [String], { nullable: true })
  imagesUrls: string[];

  @Field(() => String, { nullable: true })
  frequencyPrice: string;

  //Fields post Petition
  @Field(() => Float, { nullable: true })
  toPrice: number;

  @Field(() => String, { nullable: true })
  petitionType: string;
}

@ObjectType()
export class Post_and_recomended_response_graphql_model {
  @Field(() => Post_response_graphql_model)
  post: Post_response_graphql_model;

  @Field(() => [post_response_recomended], { nullable: true })
  recomended: post_response_recomended[];
}
