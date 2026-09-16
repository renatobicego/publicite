import { ProductionServiceInterface } from '../../domain/service/production.service.interface';

/**
 * Adapter entre el resolver y el service (el resolver nunca llama al service
 * directo). Expone las mismas operaciones que el service.
 */
export type ProductionAdapterInterface = ProductionServiceInterface;
