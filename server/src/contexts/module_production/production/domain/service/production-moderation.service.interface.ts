import {
  ProductionModerationInput,
  ProductionReportInput,
} from '../entity/models_graphql/HTTP-REQUEST/production-report.request';
import {
  ProductionModerationResultResponse,
  ProductionReceivedReportResponse,
  ProductionReportDetailResponse,
  ProductionReportResponse,
  ProductionReportTargetListResponse,
} from '../entity/models_graphql/HTTP-RESPONSE/production-report.response';
import { ProductionReportStatus } from '../entity/enum/production-report.enums';

/** Sistema de denuncias: Denuncia → Revisión → Bloqueo (§7). */
export interface ProductionModerationServiceInterface {
  reportProductionContent(
    input: ProductionReportInput,
    userId: string,
  ): Promise<ProductionReportResponse>;
  /** Denuncias que recibió un blog, para su staff. No incluye al denunciante. */
  getProductionReceivedReports(
    productionId: string,
    userId: string,
  ): Promise<ProductionReceivedReportResponse[]>;
  getProductionReportTargetsAdmin(
    status: ProductionReportStatus,
    page: number,
    limit: number,
  ): Promise<ProductionReportTargetListResponse>;
  getProductionTargetReportsAdmin(
    productionId: string,
    itemId: string | undefined,
  ): Promise<ProductionReportDetailResponse[]>;
  moderateProductionContent(
    input: ProductionModerationInput,
    adminId: string,
  ): Promise<ProductionModerationResultResponse>;
}
