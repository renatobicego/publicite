import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PostCategoryRequest {
  @Field(() => String, { nullable: false })
  label: string;
}
