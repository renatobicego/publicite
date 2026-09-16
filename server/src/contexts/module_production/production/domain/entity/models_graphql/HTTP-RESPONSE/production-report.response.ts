import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

import {
  ProductionItemKind,
  ProductionModerationStatus,
} from '../../enum/production.enums';
import {
  ProductionReportReason,
  ProductionReportStatus,
} from '../../enum/production-report.enums';
import { ProductionOwnerResponse } from './production.response';
import { ProductionTicketBuyerResponse } from './production-ticket.response';

@ObjectType({ description: 'Denuncia registrada (DEN-01)' })
export class ProductionReportResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  production: string;

  @Field(() => ID, { nullable: true })
  item?: string | null;

  @Field(() => ProductionReportReason)
  reason: ProductionReportReason;

  @Field(() => ProductionReportStatus)
  status: ProductionReportStatus;

  @Field(() => Boolean, {
    description: 'Si con esta denuncia el contenido quedó oculto (DEN-02)',
  })
  contentHidden: boolean;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType({ description: 'Detalle de una denuncia para el admin' })
export class ProductionReportDetailResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  reporter: string;

  @Field(() => ProductionTicketBuyerResponse, { nullable: true })
  reporterInfo?: ProductionTicketBuyerResponse | null;

  @Field(() => ProductionReportReason)
  reason: ProductionReportReason;

  @Field(() => String, { nullable: true })
  details?: string | null;

  @Field(() => ProductionReportStatus)
  status: ProductionReportStatus;

  @Field(() => Date, { nullable: true })
  reviewedAt?: Date | null;

  @Field(() => String, { nullable: true })
  reviewedBy?: string | null;

  @Field(() => String, { nullable: true })
  reviewNote?: string | null;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType({ description: 'Contenido denunciado, para el panel de revisión (DEN-03)' })
export class ProductionReportTargetResponse {
  @Field(() => ID)
  production: string;

  @Field(() => String, { nullable: true })
  productionTitle?: string | null;

  @Field(() => ProductionOwnerResponse, { nullable: true })
  ownerInfo?: ProductionOwnerResponse | null;

  @Field(() => ID, { nullable: true })
  item?: string | null;

  @Field(() => String, { nullable: true })
  itemName?: string | null;

  @Field(() => ProductionItemKind, { nullable: true })
  itemKind?: ProductionItemKind | null;

  @Field(() => ProductionModerationStatus, { nullable: true })
  moderationStatus?: ProductionModerationStatus | null;

  @Field(() => Int)
  reports: number;

  @Field(() => [ProductionReportReason])
  reasons: ProductionReportReason[];

  @Field(() => Date)
  lastReportAt: Date;
}

@ObjectType()
export class ProductionReportTargetListResponse {
  @Field(() => [ProductionReportTargetResponse])
  targets: ProductionReportTargetResponse[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}

@ObjectType({ description: 'Resultado de la revisión del admin' })
export class ProductionModerationResultResponse {
  @Field(() => ID)
  production: string;

  @Field(() => ID, { nullable: true })
  item?: string | null;

  @Field(() => ProductionModerationStatus)
  moderationStatus: ProductionModerationStatus;

  @Field(() => Int, { description: 'Denuncias pendientes que se cerraron' })
  resolvedReports: number;
}
