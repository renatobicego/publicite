import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

import {
  ProductionPayoutStatus,
  ProductionTicketPurchaseStatus,
} from '../../enum/production-ticket.enums';

@ObjectType()
export class ProductionTicketStatsResponse {
  @Field(() => Int, { description: 'Compras/visitas (sin rechazadas ni canceladas)' })
  purchases: number;

  @Field(() => Int, { description: 'Accesos vigentes' })
  active: number;

  @Field(() => Float, { description: 'Monto bruto de los tickets pagos confirmados' })
  revenue: number;
}

@ObjectType({ description: 'Ticket de una carpeta, archivo o blog (TKT-01..03)' })
export class ProductionTicketResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  production: string;

  @Field(() => ID, { nullable: true, description: 'null = todo el blog' })
  target?: string | null;

  @Field(() => String, { nullable: true })
  targetName?: string | null;

  @Field(() => Boolean)
  isPaid: boolean;

  @Field(() => Float)
  price: number;

  @Field(() => String)
  currency: string;

  @Field(() => Int, { nullable: true })
  durationHours?: number | null;

  @Field(() => Boolean)
  untilClose: boolean;

  @Field(() => Int, { description: 'Archivos y artículos que incluye (TKT-04)' })
  filesCount: number;

  @Field(() => ProductionTicketStatsResponse, {
    nullable: true,
    description: 'Sólo staff del blog',
  })
  stats?: ProductionTicketStatsResponse | null;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

@ObjectType({ description: 'Cuenta de Soonpublicité para transferir (TKT-05)' })
export class ProductionTicketPaymentInstructionsResponse {
  @Field(() => String, { nullable: true })
  alias?: string | null;

  @Field(() => String, { nullable: true })
  cbu?: string | null;

  @Field(() => String, { nullable: true })
  holder?: string | null;

  @Field(() => String, { nullable: true })
  bank?: string | null;

  @Field(() => Float)
  amount: number;

  @Field(() => String)
  currency: string;

  @Field(() => String, {
    nullable: true,
    description: 'Referencia a indicar en la transferencia (id de la compra)',
  })
  reference?: string | null;
}

@ObjectType({ description: 'Datos públicos del comprador (admin y staff)' })
export class ProductionTicketBuyerResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true, description: 'Sólo admin' })
  email?: string | null;
}

@ObjectType({ description: 'Compra de un ticket (RNF-07)' })
export class ProductionTicketPurchaseResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  ticket: string;

  @Field(() => ID)
  production: string;

  @Field(() => String)
  productionTitle: string;

  @Field(() => ID, { nullable: true })
  target?: string | null;

  @Field(() => String, { nullable: true })
  targetName?: string | null;

  @Field(() => ID)
  buyer: string;

  @Field(() => ProductionTicketBuyerResponse, { nullable: true })
  buyerInfo?: ProductionTicketBuyerResponse | null;

  @Field(() => ID)
  creator: string;

  @Field(() => ProductionTicketPurchaseStatus)
  status: ProductionTicketPurchaseStatus;

  @Field(() => String, { nullable: true })
  statusReason?: string | null;

  @Field(() => Boolean)
  isPaid: boolean;

  @Field(() => Float)
  amount: number;

  @Field(() => String)
  currency: string;

  @Field(() => Float, { nullable: true, description: 'Admin y staff' })
  commissionPercent?: number | null;

  @Field(() => Float, { nullable: true, description: 'Admin y staff' })
  commissionAmount?: number | null;

  @Field(() => Float, { nullable: true, description: 'Admin y staff' })
  creatorPayoutAmount?: number | null;

  @Field(() => Int, { nullable: true })
  durationHours?: number | null;

  @Field(() => Boolean)
  untilClose: boolean;

  @Field(() => Int)
  filesCount: number;

  @Field(() => Boolean)
  acceptedNoRefund: boolean;

  @Field(() => String, { nullable: true })
  transferReference?: string | null;

  @Field(() => Date, { nullable: true })
  confirmedAt?: Date | null;

  @Field(() => Date, { nullable: true })
  activatedAt?: Date | null;

  @Field(() => Date, { nullable: true })
  expiresAt?: Date | null;

  @Field(() => String, {
    nullable: true,
    description: 'Alias/CBU del creador para liquidar el 90% (sólo admin, TKT-11)',
  })
  payoutAliasCbu?: string | null;

  @Field(() => ProductionPayoutStatus, { nullable: true, description: 'Admin y staff' })
  payoutStatus?: ProductionPayoutStatus | null;

  @Field(() => Date, { nullable: true })
  payoutAt?: Date | null;

  @Field(() => String, { nullable: true, description: 'Sólo admin' })
  facturaUrl?: string | null;

  @Field(() => Date, { nullable: true })
  facturaUploadedAt?: Date | null;

  @Field(() => Boolean)
  reviewRequired: boolean;

  @Field(() => Date, { nullable: true })
  reviewedAt?: Date | null;

  @Field(() => ProductionTicketPaymentInstructionsResponse, {
    nullable: true,
    description: 'Sólo para el comprador mientras la compra está pendiente',
  })
  paymentInstructions?: ProductionTicketPaymentInstructionsResponse | null;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}

@ObjectType()
export class ProductionTicketPurchaseListResponse {
  @Field(() => [ProductionTicketPurchaseResponse])
  purchases: ProductionTicketPurchaseResponse[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}

@ObjectType({ description: 'Paso previo a la compra (TKT-04)' })
export class ProductionTicketCheckoutResponse {
  @Field(() => ProductionTicketResponse)
  ticket: ProductionTicketResponse;

  @Field(() => String)
  productionTitle: string;

  @Field(() => Boolean, {
    description: 'Si hay que aceptar explícitamente la política sin devoluciones',
  })
  requiresNoRefundAcceptance: boolean;

  @Field(() => String)
  noRefundWarning: string;

  @Field(() => ProductionTicketPaymentInstructionsResponse, { nullable: true })
  paymentInstructions?: ProductionTicketPaymentInstructionsResponse | null;

  @Field(() => ProductionTicketPurchaseResponse, {
    nullable: true,
    description: 'Compra abierta del visitante para este ticket, si ya existe',
  })
  existingPurchase?: ProductionTicketPurchaseResponse | null;
}
