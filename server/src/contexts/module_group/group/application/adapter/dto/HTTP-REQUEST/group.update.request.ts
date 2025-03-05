import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GroupUpdateRequest {
  @Field(() => String)
  _id: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  alias?: string;

  @Field(() => String, { nullable: true })
  rules?: string;

  @Field(() => String, { nullable: true })
  details?: string;

  @Field(() => String, { nullable: true })
  profilePhotoUrl?: string;

  @Field(() => String, { nullable: true })
  visibility?: string;

  @Field(() => String, { nullable: true })
  groupNote?: string;


}
