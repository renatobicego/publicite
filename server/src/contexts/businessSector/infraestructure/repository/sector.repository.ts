import { SectorRepositoryInterface } from '../../domain/repository/sector.repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SectorDocument } from '../schema/sector.schema';
import { Model } from 'mongoose';
import { Sector } from '../../domain/entity/sector.entity';

export class SectorRepository implements SectorRepositoryInterface {
  constructor(
    @InjectModel('Sector')
    private readonly sectorModel: Model<SectorDocument>,
  ) {}
  async getAll(): Promise<Sector[]> {
    try {
      const sectorDocuments = await this.sectorModel.find();
      return sectorDocuments.map((doc) => Sector.formatDocumentToClass(doc));
    } catch (error: any) {
      throw error;
    }
  }
}
