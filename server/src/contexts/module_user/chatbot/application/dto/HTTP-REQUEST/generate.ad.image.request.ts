import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class GenerateAdImageRequest {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @MaxLength(200, {
    message: 'El prompt no puede superar los 200 caracteres',
  })
  prompt: string;
}
