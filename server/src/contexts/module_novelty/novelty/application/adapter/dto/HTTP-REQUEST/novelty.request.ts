import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class NoveltyPropertyRequest {
  @Field(() => String)
  key: string;

  @Field(() => String)
  value: string;
}

@InputType()
export class NoveltyBlockRequest {
  @Field(() => String)
  type: string;

  @Field(() => String)
  data: string;
}

@InputType()
export class NoveltyRequest {
  @Field(() => [NoveltyPropertyRequest], { nullable: false })
  properties: NoveltyPropertyRequest[];

  @Field(() => [NoveltyBlockRequest], { nullable: false })
  blocks: NoveltyBlockRequest[];
}
