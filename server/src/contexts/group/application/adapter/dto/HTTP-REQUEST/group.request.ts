import { Field, InputType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@InputType()
export class GroupRequest {
  @Field(() => [String])
  members: ObjectId[];

  @Field(() => [String])
  admins: ObjectId[];

  @Field(() => String)
  name: string;

  @Field(() => String)
  rules: string;

  @Field(() => [String])
  magazines: ObjectId[];

  @Field(() => String)
  details: string;

  @Field(() => String)
  profilePhotoUrl: string;

  @Field(() => String)
  visibility: string;
}
