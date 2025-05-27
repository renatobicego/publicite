import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { Inject } from '@nestjs/common';
import { SectorRepositoryInterface } from '../../domain/repository/sector.repository.interface';
import { SectorServiceInterface } from '../../domain/service/sector.service.interface';
import {
  SectorResponse,
  SectorResponseDto,
} from '../../infrastructure/controller/request/sector.dto';

export class SectorService implements SectorServiceInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('SectorRepositoryInterface')
    private readonly sectorRepository: SectorRepositoryInterface,
  ) {}
  async getAll(): Promise<SectorResponse[]> {
    try {
      this.logger.log('Getting all sectors in service');
      const sectors = await this.sectorRepository.getAll();
      return sectors.map((doc) => SectorResponseDto.formatClassToResponse(doc));
    } catch (error) {
      this.logger.error(
        'An error has ocurred while getting all sectors: ' + error,
      );
      throw error;
    }
  }
}
