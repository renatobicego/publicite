import { InputType, Field } from "@nestjs/graphql";
import { Visibility } from "../../../infrastructure/enum/visibility.enum.board";

@InputType()
export class BoardRequest {
  @Field(() => [String], { nullable: true })
  annotations: string[];

  @Field(() => Visibility, { nullable: true })
  visibility: string;

  @Field(() => String, { nullable: true })
  user: string;

  @Field(() => String, { nullable: true })
  color: string;

  @Field(() => [String], { nullable: true })
  keywords: string[];

  @Field(() => String, { nullable: true })
  searchTerm: string;
}

