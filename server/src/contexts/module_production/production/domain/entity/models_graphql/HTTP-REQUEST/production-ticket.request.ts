import { Field, Float, ID, InputType, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

import {
  ProductionPayoutStatus,
  ProductionTicketPurchaseStatus,
} from '../../enum/production-ticket.enums';

@InputType({ description: 'Page de Ticket: asignar un ticket (TKT-01..03)' })
export class ProductionTicketCreateRequest {
  @Field(() => ID)
  @IsMongoId()
  productionId: string;

  @Field(() => ID, {
    nullable: true,
    description: 'Carpeta o archivo; vacío = todo el blog',
  })
  @IsOptional()
  @IsMongoId()
  targetId?: string;

  @Field(() => Boolean, { description: 'Toggle pago / gratuito (TKT-02)' })
  @IsBoolean()
  isPaid: boolean;

  @Field(() => Float, { nullable: true, description: 'Obligatorio si es pago' })
  @IsOptional()
  @Min(0)
  price?: number;

  @Field(() => String, { nullable: true, description: 'Default ARS' })
  @IsOptional()
  @Matches(/^[A-Z]{3}$/, { message: 'currency debe ser un código ISO de 3 letras' })
  currency?: string;

  @Field(() => Int, {
    nullable: true,
    description: 'Duración en horas (mínimo 24). Ignorada si untilClose',
  })
  @IsOptional()
  @IsInt()
  durationHours?: number;

  @Field(() => Boolean, {
    nullable: true,
    description: 'El acceso dura hasta el cierre del blog',
  })
  @IsOptional()
  @IsBoolean()
  untilClose?: boolean;
}

@InputType()
export class ProductionTicketUpdateRequest {
  @Field(() => Boolean, { nullable: true, description: 'Toggle pago / gratuito' })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  price?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^[A-Z]{3}$/, { message: 'currency debe ser un código ISO de 3 letras' })
  currency?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  durationHours?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  untilClose?: boolean;
}

@InputType({ description: 'Compra de un ticket (TKT-04/05)' })
export class ProductionTicketPurchaseRequest {
  @Field(() => ID)
  @IsMongoId()
  ticketId: string;

  @Field(() => Boolean, {
    description:
      'Aceptación explícita de que no hay devoluciones (obligatoria en tickets pagos)',
  })
  @IsBoolean()
  acceptNoRefund: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'Referencia o comprobante de la transferencia',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  transferReference?: string;
}

@InputType()
export class ProductionTicketPurchaseFilters {
  @Field(() => ProductionTicketPurchaseStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProductionTicketPurchaseStatus)
  status?: ProductionTicketPurchaseStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  productionId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  buyerId?: string;

  @Field(() => ProductionPayoutStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProductionPayoutStatus)
  payoutStatus?: ProductionPayoutStatus;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  hasFactura?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}

@InputType({ description: 'Factura del 10% de comisión (TKT-06)' })
export class AttachProductionTicketFacturaInput {
  @Field(() => ID)
  @IsMongoId()
  purchaseId: string;

  @Field(() => String, { description: 'URL del PDF/imagen ya subido' })
  @IsNotEmpty()
  @IsUrl({ require_protocol: true }, { message: 'facturaUrl debe ser una URL válida' })
  @MaxLength(1000)
  facturaUrl: string;
}

@InputType()
export class ProductionTicketRejectInput {
  @Field(() => ID)
  @IsMongoId()
  purchaseId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Indicá el motivo del rechazo' })
  @MaxLength(500)
  reason: string;
}
