import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SubscriptionCheckoutResponse {
  @Field(() => String)
  mpPreapprovalId: string;

  @Field(() => String, { description: 'Estado del preapproval en MercadoPago (authorized, pending, ...)' })
  status: string;

  @Field(() => Boolean, {
    description: 'false si MP aceptó el pago pero todavía no quedó guardado (lo registra el webhook)',
  })
  registered: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: 'En un cambio de plan: si se dio de baja el plan anterior. null si no hubo cambio',
  })
  previousSubscriptionCancelled: boolean | null;

  @Field(() => String, { nullable: true, description: 'Aviso para mostrar al usuario' })
  warning: string | null;
}
