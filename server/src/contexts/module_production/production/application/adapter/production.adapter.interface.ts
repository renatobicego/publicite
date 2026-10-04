import { ProductionServiceInterface } from '../../domain/service/production.service.interface';
import { ProductionInsightsServiceInterface } from '../../domain/service/production-insights.service.interface';

/**
 * Adapter entre el resolver y los services (el resolver nunca llama a un
 * service directo). Expone las mismas operaciones que los services.
 */
export interface ProductionAdapterInterface
  extends ProductionServiceInterface,
    ProductionInsightsServiceInterface {}
