import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class StartSubscriptionCheckoutInput {
  @Field(() => String, {
    description: 'id del plan en MercadoPago (preapproval_plan), el de la URL del checkout',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  mpPreapprovalPlanId: string;

  @Field(() => String, { description: 'Token de la tarjeta que devuelve el Brick de MercadoPago' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  cardTokenId: string;

  @Field(() => String)
  @IsEmail()
  @MaxLength(320)
  payerEmail: string;

  @Field(() => String, {
    nullable: true,
    description: 'mpPreapprovalId del plan actual, cuando es un cambio de plan',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  replacesSubscriptionId?: string;
}
