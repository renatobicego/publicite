import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

@InputType()
export class SendMessageRequest {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  message: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;
}

