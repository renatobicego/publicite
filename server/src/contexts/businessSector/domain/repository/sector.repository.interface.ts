import { Sector } from 'src/contexts/user/domain/entity/sector.entity';

export interface SectorRepositoryInterface {
  getAll(): Promise<Sector[]>;
}
