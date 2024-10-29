import { Field } from '@nestjs/graphql';

export class MagazineSectionCreateRequest {
  @Field(() => String)
  title: string;

  @Field(() => Boolean)
  isFatherSection: boolean;
}
