import { Inject } from '@nestjs/common';

import { SectorResponse } from '../controller/request/sector.dto';
import { SectorServiceInterface } from '../../domain/service/sector.service.interface';
import { SectorAdapterInterface } from '../../application/adapter/sector.adapter.interface';

export class SectorAdapter implements SectorAdapterInterface {
  constructor(
    @Inject('SectorServiceInterface')
    private readonly sectorService: SectorServiceInterface,
  ) {}
  async getAll(): Promise<SectorResponse[]> {
    const sectors = await this.sectorService.getAll();
    return sectors;
  }
}
