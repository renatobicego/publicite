import { Inject, Injectable } from '@nestjs/common';

import { ProductionModerationAdapterInterface } from '../../application/adapter/production-moderation.adapter.interface';
import { ProductionModerationServiceInterface } from '../../domain/service/production-moderation.service.interface';
import {
  ProductionModerationInput,
  ProductionReportInput,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/production-report.request';
import { ProductionReportStatus } from '../../domain/entity/enum/production-report.enums';

@Injectable()
export class ProductionModerationAdapter
  implements ProductionModerationAdapterInterface
{
  constructor(
    @Inject('ProductionModerationServiceInterface')
    private readonly moderationService: ProductionModerationServiceInterface,
  ) {}

  reportProductionContent(input: ProductionReportInput, userId: string) {
    return this.moderationService.reportProductionContent(input, userId);
  }

  getProductionReportTargetsAdmin(
    status: ProductionReportStatus,
    page: number,
    limit: number,
  ) {
    return this.moderationService.getProductionReportTargetsAdmin(
      status,
      page,
      limit,
    );
  }

  getProductionTargetReportsAdmin(productionId: string, itemId?: string) {
    return this.moderationService.getProductionTargetReportsAdmin(
      productionId,
      itemId,
    );
  }

  moderateProductionContent(input: ProductionModerationInput, adminId: string) {
    return this.moderationService.moderateProductionContent(input, adminId);
  }
}
