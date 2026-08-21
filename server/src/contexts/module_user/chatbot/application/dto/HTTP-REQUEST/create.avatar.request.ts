import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateAvatarRequest {
  @Field(() => String, { description: 'Nombre visible del avatar' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  name: string;

  @Field(() => String, {
    description: 'Instrucciones de comportamiento del avatar',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  context: string;
}
