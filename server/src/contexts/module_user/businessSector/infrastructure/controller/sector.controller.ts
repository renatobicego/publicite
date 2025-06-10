import { Controller, Get, Inject } from '@nestjs/common';
import { SectorResponse } from './request/sector.dto';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { SectorAdapterInterface } from '../../application/adapter/sector.adapter.interface';


@Controller('/businessSector')
export class SectorController {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('SectorAdapterInterface')
    private readonly sectorAdapter: SectorAdapterInterface,
  ) {}

  @Get()
  async getAllSectors(): Promise<SectorResponse[]> {
    try {
      this.logger.log(`Searching all sectors of publicite`);
      const sectors: SectorResponse[] = await this.sectorAdapter.getAll();
      return sectors;
    } catch (error: any) {
      throw error;
    }
  }
}
