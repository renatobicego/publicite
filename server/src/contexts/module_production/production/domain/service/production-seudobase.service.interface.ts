import {
  ProductionBulkDeleteInput,
  ProductionBulkPriceInput,
  ProductionBulkVisibilityInput,
  ProductionSeudoBaseFilters,
} from '../entity/models_graphql/HTTP-REQUEST/production-seudobase.request';
import {
  ProductionAuditLogResponse,
  ProductionBulkResultResponse,
  ProductionSeudoBaseResponse,
} from '../entity/models_graphql/HTTP-RESPONSE/production-seudobase.response';

/** SeudoBase: vista tipo Excel y gestión masiva del blog (§5). */
export interface ProductionSeudoBaseServiceInterface {
  getProductionSeudoBase(
    productionId: string,
    userId: string,
    filters: ProductionSeudoBaseFilters | undefined,
    page: number,
    limit: number,
  ): Promise<ProductionSeudoBaseResponse>;
  bulkUpdateProductionPrices(
    input: ProductionBulkPriceInput,
    userId: string,
  ): Promise<ProductionBulkResultResponse>;
  bulkUpdateProductionVisibility(
    input: ProductionBulkVisibilityInput,
    userId: string,
  ): Promise<ProductionBulkResultResponse>;
  bulkDeleteProductionItems(
    input: ProductionBulkDeleteInput,
    userId: string,
  ): Promise<ProductionBulkResultResponse>;
  getProductionAuditLog(
    productionId: string,
    userId: string,
    page: number,
    limit: number,
  ): Promise<ProductionAuditLogResponse>;
}
