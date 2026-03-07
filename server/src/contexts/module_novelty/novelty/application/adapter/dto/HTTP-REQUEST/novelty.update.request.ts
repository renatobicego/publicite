import { Field, InputType } from '@nestjs/graphql';
import {
  NoveltyBlockRequest,
  NoveltyPropertyRequest,
} from './novelty.request';

@InputType()
export class NoveltyUpdateRequest {
  @Field(() => String)
  _id: string;

  @Field(() => [NoveltyPropertyRequest], { nullable: true })
  properties?: NoveltyPropertyRequest[];

  @Field(() => [NoveltyBlockRequest], { nullable: true })
  blocks?: NoveltyBlockRequest[];
}
