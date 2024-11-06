import { Field, InputType } from '@nestjs/graphql';


@InputType()
export class MagazineSectionCreateRequest {
  @Field(() => String)
  title: string;

  @Field(() => Boolean)
  isFatherSection: boolean;
}
