import { ProductionConsumptionResponse } from '../entity/models_graphql/HTTP-RESPONSE/production-consumption.response';

export interface ProductionInsightsServiceInterface {
  /**
   * CONTROL Consumo (PC-05, SB-05): tokens de IA del usuario y archivos usados
   * vs. límite de sus blogs, o de un blog puntual del que sea staff.
   */
  getProductionConsumption(
    userId: string,
    productionId?: string,
  ): Promise<ProductionConsumptionResponse>;
}
