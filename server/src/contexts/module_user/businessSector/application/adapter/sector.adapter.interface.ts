import { SectorResponse } from '../../infrastructure/controller/request/sector.dto';

export interface SectorAdapterInterface {
  getAll(): Promise<SectorResponse[]>;
}
