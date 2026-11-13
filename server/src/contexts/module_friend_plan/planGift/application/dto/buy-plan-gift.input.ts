import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

@InputType()
export class BuyPlanGiftInput {
  @Field(() => String, { description: 'id del plan en MercadoPago (preapproval_plan)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  mpPreapprovalPlanId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  months: number;

  @Field(() => String, { nullable: true, description: 'Destinatario con cuenta (mongoId)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  recipientUserId?: string;

  @Field(() => String, { nullable: true, description: 'Destinatario sin cuenta: su email' })
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  recipientEmail?: string;

  @Field(() => String, { description: 'Token de la tarjeta que devuelve el Brick' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  cardTokenId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  paymentMethodId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  issuerId?: string;

  @Field(() => String)
  @IsEmail()
  @MaxLength(320)
  payerEmail: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  identificationType?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  identificationNumber?: string;
}
