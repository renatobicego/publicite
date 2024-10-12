import { Field, InputType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@InputType()
export class GroupUpdateRequest {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  admin: string;

  @Field(() => [String], { nullable: true })
  members: ObjectId[];

  @Field(() => [String], { nullable: true })
  admins: ObjectId[];

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  rules: string;

  @Field(() => [String], { nullable: true })
  magazines: ObjectId[];

  @Field(() => String, { nullable: true })
  details: string;

  @Field(() => String, { nullable: true })
  profilePhotoUrl: string;

  @Field(() => String, { nullable: true })
  visibility: string;
}
