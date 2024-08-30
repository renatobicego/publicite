import { SectorResponse } from '../../infraestructure/controller/request/sector.dto';

export interface SectorAdapterInterface {
  getAll(): Promise<SectorResponse[]>;
}
