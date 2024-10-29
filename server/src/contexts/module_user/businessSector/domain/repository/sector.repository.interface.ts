import { ObjectId } from 'mongoose';
import { Sector } from '../entity/sector.entity';

export interface SectorRepositoryInterface {
  getAll(): Promise<Sector[]>;
  validateSector(sectorId: ObjectId): Promise<void | Error>;
}
