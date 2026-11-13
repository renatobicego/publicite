import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEmail, IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class PayFriendGroupInput {
  @Field(() => ID)
  @IsMongoId()
  groupId: string;

  @Field(() => String, { description: 'Token de la tarjeta que devuelve el Brick' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  cardTokenId: string;

  @Field(() => String)
  @IsEmail()
  @MaxLength(320)
  payerEmail: string;
}
