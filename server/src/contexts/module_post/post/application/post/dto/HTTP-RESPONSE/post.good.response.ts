import { Field } from '@nestjs/graphql';


export class PostGoodResponse_graphql {
  @Field(() => String)
  _id: string;
}
