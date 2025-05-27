import { SectorResponse } from '../../infrastructure/controller/request/sector.dto';

export interface SectorServiceInterface {
  getAll(): Promise<SectorResponse[]>;
}
