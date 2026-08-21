import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

import { Payment } from './payment.model.graphql';
import { Subscription } from './subscription.model.graphql';

/**
 * Un ticket visto desde el panel admin: los mismos datos que ve el usuario en
 * su historial de pagos, más quién lo pagó y la factura asociada.
 */
@ObjectType()
export class AdminInvoice {
  @Field(() => ID)
  _id: string;

  @Field(() => Payment, { nullable: true })
  paymentId: Payment;

  @Field(() => Subscription, { nullable: true })
  subscriptionId: Subscription;

  @Field(() => String)
  status: string;

  @Field(() => String)
  paymentStatus: string;

  @Field(() => String)
  external_reference: string;

  @Field(() => String, { nullable: true })
  timeOfUpdate: string;

  @Field(() => String)
  invoice_id: string;

  @Field(() => Float)
  transactionAmount: number;

  @Field(() => String, { nullable: true })
  currencyId: string;

  @Field(() => String, { nullable: true })
  reason: string;

  @Field(() => String, { nullable: true })
  nextRetryDay: string;

  @Field(() => Int, { nullable: true })
  retryAttempts: number;

  @Field(() => String, { nullable: true })
  rejectionCode: string;

  // ---- Datos del usuario (resueltos por external_reference) ----

  @Field(() => String, {
    description: 'Nombre y apellido del usuario, o "-" si ya no existe',
  })
  userName: string;

  @Field(() => String, { nullable: true })
  userEmail: string | null;

  @Field(() => String, { nullable: true })
  userUsername: string | null;

  // ---- Factura cargada por el admin ----

  @Field(() => String, { nullable: true })
  facturaUrl: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'Fecha de carga de la factura en ISO',
  })
  facturaUploadedAt: string | null;

  @Field(() => String, { nullable: true })
  facturaUploadedBy: string | null;
}

@ObjectType()
export class AdminInvoiceGetAllResponse {
  @Field(() => [AdminInvoice])
  invoices: AdminInvoice[];

  @Field(() => Boolean)
  hasMore: boolean;

  @Field(() => Int, { description: 'Total de tickets que matchean los filtros' })
  total: number;
}
