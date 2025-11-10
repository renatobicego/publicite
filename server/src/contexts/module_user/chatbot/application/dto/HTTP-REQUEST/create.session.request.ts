import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateSessionRequest {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;
}

