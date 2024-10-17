import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
class userBoardGraphql {
  @Field(() => ID, { nullable: true })
  _id: ObjectId;

  @Field(() => String, { nullable: true })
  profilePhotoUrl: string;

  @Field(() => String, { nullable: true })
  name: string;
}

@ObjectType()
export class BoardResponse {
  @Field(() => ID, { nullable: true })
  _id: ObjectId | undefined;

  @Field(() => [String], { nullable: true })
  annotations: string[];

  @Field(() => String, { nullable: true })
  visibility: string;

  @Field(() => userBoardGraphql)
  user: userBoardGraphql;

  @Field(() => String, { nullable: true })
  color: string;

  @Field(() => [String], { nullable: true })
  keywords: string[];
}

@ObjectType()
export class BoardGetAllResponse {
  @Field(() => [BoardResponse])
  boards: BoardResponse[];

  @Field(() => Boolean)
  hasMore: boolean;
}
