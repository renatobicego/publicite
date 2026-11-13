import { UseGuards } from '@nestjs/common';
import { Args, Field, Float, ID, InputType, Int, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { AdminGuard } from 'src/contexts/module_shared/auth/clerk-auth/admin.guard';
import { MpTestService } from '../../application/service/mp-test.service';

@InputType()
export class MpTestPaymentInput {
  @Field(() => Float)
  @IsNumber()
  amount: number;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  cardTokenId: string;

  @Field(() => String)
  @IsEmail()
  payerEmail: string;

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

@ObjectType()
export class MpTestEventModel {
  @Field(() => ID)
  _id: string;

  @Field(() => String, { nullable: true })
  topic?: string;

  @Field(() => String, { nullable: true })
  action?: string;

  @Field(() => String, { nullable: true })
  dataId?: string;

  @Field(() => String, { nullable: true })
  externalReference?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => Float, { nullable: true })
  amount?: number;

  @Field(() => String)
  receivedAt: string;

  @Field(() => String, { nullable: true, description: 'Objeto completo de MP, en JSON' })
  payload?: string;
}

/*
Pruebas de la Fase 0 contra MercadoPago (panel admin). Sólo admin. Devuelve las
respuestas crudas de MP en JSON. Se borra cuando terminen las pruebas.
*/
@Resolver()
@UseGuards(ClerkAuthGuard, AdminGuard)
export class MpTestResolver {
  constructor(private readonly mpTestService: MpTestService) {}

  @Mutation(() => String, { description: 'Sólo admin: suscripción de prueba SIN plan asociado' })
  async mpTestCreatePreapproval(
    @Args('amount', { type: () => Float }) amount: number,
    @Args('cardTokenId', { type: () => String }) cardTokenId: string,
    @Args('payerEmail', { type: () => String }) payerEmail: string,
  ): Promise<string> {
    return this.mpTestService.createPreapproval(amount, cardTokenId, payerEmail);
  }

  @Query(() => String, { description: 'Sólo admin: consulta un preapproval de prueba' })
  async mpTestGetPreapproval(
    @Args('preapprovalId', { type: () => String }) preapprovalId: string,
  ): Promise<string> {
    return this.mpTestService.getPreapproval(preapprovalId);
  }

  @Mutation(() => String, {
    description: 'Sólo admin: pausa, reactiva o cancela un preapproval de prueba',
  })
  async mpTestSetPreapprovalStatus(
    @Args('preapprovalId', { type: () => String }) preapprovalId: string,
    @Args('status', { type: () => String }) status: string,
  ): Promise<string> {
    return this.mpTestService.setPreapprovalStatus(preapprovalId, status);
  }

  @Mutation(() => String, { description: 'Sólo admin: pago único de prueba' })
  async mpTestCreatePayment(
    @Args('input', { type: () => MpTestPaymentInput }) input: MpTestPaymentInput,
  ): Promise<string> {
    return this.mpTestService.createPayment(input);
  }

  @Query(() => [MpTestEventModel], { description: 'Sólo admin: eventos de prueba que llegaron por webhook' })
  async mpTestEvents(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<MpTestEventModel[]> {
    const events = await this.mpTestService.listEvents(limit ?? 50);
    return events.map((event: any) => ({
      _id: event._id.toString(),
      topic: event.topic,
      action: event.action,
      dataId: event.dataId,
      externalReference: event.externalReference,
      status: event.status,
      amount: event.amount,
      receivedAt: new Date(event.receivedAt).toISOString(),
      payload: event.payload ? JSON.stringify(event.payload, null, 2) : undefined,
    }));
  }
}
