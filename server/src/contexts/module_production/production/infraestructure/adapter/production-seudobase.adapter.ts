import { Inject, Injectable } from '@nestjs/common';

import { ProductionSeudoBaseAdapterInterface } from '../../application/adapter/production-seudobase.adapter.interface';
import { ProductionSeudoBaseServiceInterface } from '../../domain/service/production-seudobase.service.interface';
import {
  ProductionBulkDeleteInput,
  ProductionBulkPriceInput,
  ProductionBulkVisibilityInput,
  ProductionSeudoBaseFilters,
} from '../../domain/entity/models_graphql/HTTP-REQUEST/production-seudobase.request';

@Injectable()
export class ProductionSeudoBaseAdapter
  implements ProductionSeudoBaseAdapterInterface
{
  constructor(
    @Inject('ProductionSeudoBaseServiceInterface')
    private readonly seudoBaseService: ProductionSeudoBaseServiceInterface,
  ) {}

  getProductionSeudoBase(
    productionId: string,
    userId: string,
    filters: ProductionSeudoBaseFilters | undefined,
    page: number,
    limit: number,
  ) {
    return this.seudoBaseService.getProductionSeudoBase(
      productionId,
      userId,
      filters,
      page,
      limit,
    );
  }

  bulkUpdateProductionPrices(input: ProductionBulkPriceInput, userId: string) {
    return this.seudoBaseService.bulkUpdateProductionPrices(input, userId);
  }

  bulkUpdateProductionVisibility(
    input: ProductionBulkVisibilityInput,
    userId: string,
  ) {
    return this.seudoBaseService.bulkUpdateProductionVisibility(input, userId);
  }

  bulkDeleteProductionItems(input: ProductionBulkDeleteInput, userId: string) {
    return this.seudoBaseService.bulkDeleteProductionItems(input, userId);
  }

  getProductionAuditLog(
    productionId: string,
    userId: string,
    page: number,
    limit: number,
  ) {
    return this.seudoBaseService.getProductionAuditLog(
      productionId,
      userId,
      page,
      limit,
    );
  }
}
