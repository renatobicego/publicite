import { Field, InputType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Visibility } from 'src/contexts/board/infrastructure/enum/visibility.enum.board';

@InputType()
export class UpdateBoardDto {
  @Field(() => [String], { nullable: true })
  annotations: string[];

  @Field(() => Visibility, { nullable: true })
  visibility: Visibility;

  @Field(() => String, { nullable: true })
  color: string;

  @Field(() => [String], { nullable: true })
  keywords: string[];
}
