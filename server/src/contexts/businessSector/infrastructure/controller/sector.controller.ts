import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SectorResponse } from './request/sector.dto';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { SectorAdapterInterface } from '../../application/adapter/sector.adapter.interface';

@ApiTags('Business sector management')
@Controller('/businessSector')
export class SectorController {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('SectorAdapterInterface')
    private readonly sectorAdapter: SectorAdapterInterface,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all sectors of publicite' })
  @ApiResponse({
    status: 200,
    description: 'Return all sectors.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
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
