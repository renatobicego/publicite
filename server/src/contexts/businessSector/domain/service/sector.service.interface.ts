import { SectorResponse } from '../../infraestructure/controller/request/sector.dto';

export interface SectorServiceInterface {
  getAll(): Promise<SectorResponse[]>;
}
