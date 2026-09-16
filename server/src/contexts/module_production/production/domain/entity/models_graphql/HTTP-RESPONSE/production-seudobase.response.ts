import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

import {
  ProductionFileType,
  ProductionItemKind,
  ProductionModerationStatus,
} from '../../enum/production.enums';
import { ProductionBulkAction } from '../../enum/production-seudobase.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';
import {
  ProductionOwnerResponse,
  ProductionTicketSummaryResponse,
} from './production.response';

@ObjectType({ description: 'Fila de la SeudoBase (Foto, Nº, Título, Precio, ...)' })
export class ProductionSeudoBaseRowResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => ProductionItemKind)
  kind: ProductionItemKind;

  @Field(() => String, { description: 'Título' })
  name: string;

  @Field(() => String, { nullable: true, description: 'Nº / ID del archivo' })
  fileName?: string | null;

  @Field(() => ProductionFileType, { nullable: true })
  fileType?: ProductionFileType | null;

  @Field(() => String, { nullable: true, description: 'Key de UploadThing (foto)' })
  key?: string | null;

  @Field(() => ID, { nullable: true })
  parent?: string | null;

  @Field(() => String, { nullable: true, description: 'Camino de carpetas' })
  path?: string | null;

  @Field(() => Visibility, { nullable: true })
  visibility?: Visibility | null;

  @Field(() => Visibility)
  effectiveVisibility: Visibility;

  @Field(() => ProductionTicketSummaryResponse, {
    nullable: true,
    description: 'Ticket propio del ítem (el que edita el cambio de precio)',
  })
  ownTicket?: ProductionTicketSummaryResponse | null;

  @Field(() => ProductionTicketSummaryResponse, {
    nullable: true,
    description: 'Ticket que aplica (propio o heredado)',
  })
  effectiveTicket?: ProductionTicketSummaryResponse | null;

  @Field(() => Float, { nullable: true, description: 'Precio que aplica' })
  price?: number | null;

  @Field(() => ProductionModerationStatus)
  moderationStatus: ProductionModerationStatus;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class ProductionSeudoBaseResponse {
  @Field(() => [ProductionSeudoBaseRowResponse])
  rows: ProductionSeudoBaseRowResponse[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}

@ObjectType({ description: 'Resultado de una operación masiva' })
export class ProductionBulkResultResponse {
  @Field(() => ProductionBulkAction)
  action: ProductionBulkAction;

  @Field(() => Int)
  requested: number;

  @Field(() => Int)
  affected: number;

  @Field(() => [ID], {
    description: 'Ítems que no se modificaron (ej. sin ticket pago propio)',
  })
  skipped: string[];

  @Field(() => ID)
  auditId: string;
}

@ObjectType({ description: 'Registro de auditoría (SB-03)' })
export class ProductionAuditEntryResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => ProductionBulkAction)
  action: ProductionBulkAction;

  @Field(() => ID)
  actor: string;

  @Field(() => ProductionOwnerResponse, { nullable: true })
  actorInfo?: ProductionOwnerResponse | null;

  @Field(() => [ID])
  itemIds: string[];

  @Field(() => Int)
  affectedCount: number;

  @Field(() => String, { description: 'JSON con parámetros y antes/después' })
  details: string;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class ProductionAuditLogResponse {
  @Field(() => [ProductionAuditEntryResponse])
  entries: ProductionAuditEntryResponse[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
