import { Field, InputType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Visibility } from 'src/contexts/module_group/group/domain/entity/enum/group.visibility.enum';


@InputType()
export class GroupRequest {
  @Field(() => [String])
  members: ObjectId[];

  @Field(() => [String])
  admins: ObjectId[];

  @Field(() => String)
  name: string;

  @Field(() => String)
  alias: string;

  @Field(() => String)
  rules: string;

  @Field(() => [String])
  magazines: ObjectId[];

  @Field(() => String)
  details: string;

  @Field(() => String)
  profilePhotoUrl: string;

  @Field(() => Visibility)
  visibility: Visibility;

  @Field(() => String, { nullable: true })
  groupNote: string;



}
