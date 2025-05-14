import { SectorRepositoryInterface } from '../../domain/repository/sector.repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SectorDocument } from '../schema/sector.schema';
import { Model, ObjectId } from 'mongoose';
import { Sector } from '../../domain/entity/sector.entity';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

export class SectorRepository implements SectorRepositoryInterface {
  constructor(
    @InjectModel('Sector')
    private readonly sectorModel: Model<SectorDocument>,
    private readonly logger: MyLoggerService,
  ) {}
  async validateSector(sectorId: ObjectId): Promise<void | Error> {
    try {
      return this.sectorModel
        .findById(sectorId)
        .then((sector) => {
          if (!sector) {
            this.logger.error(
              'Sector not found, plase try again with a valid id',
            );
            throw Error('Sector not found');
          }
        })
        .catch((error) => {
          throw error;
        });
    } catch (error: any) {
      return Promise.reject(error);
    }
  }
  async getAll(): Promise<Sector[]> {
    try {
      const sectorDocuments = await this.sectorModel.find().sort({ label: 1 });

      return sectorDocuments.map((doc) => Sector.formatDocumentToClass(doc));
    } catch (error: any) {
      throw error;
    }
  }
}
