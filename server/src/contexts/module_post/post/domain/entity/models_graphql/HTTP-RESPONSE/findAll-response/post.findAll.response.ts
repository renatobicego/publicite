import { Field, ObjectType } from '@nestjs/graphql';
import { Post_response_graphql_model } from '../post.response.graphql';

@ObjectType()
export class PostFindAllResponse {
  @Field(() => [Post_response_graphql_model])
  posts: Post_response_graphql_model[];

  @Field(() => Boolean)
  hasMore: boolean;
}
