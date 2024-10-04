import { Inject } from '@nestjs/common';
import { MagazineCreateRequest } from 'src/contexts/magazine/application/adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineAdapterInterface } from 'src/contexts/magazine/application/adapter/magazine.adapter.interface';
import { MagazineServiceInterface } from 'src/contexts/magazine/domain/service/magazine.service.interface';

export class MagazineAdapter implements MagazineAdapterInterface {
  constructor(
    @Inject('MagazineServiceInterface')
    private readonly magazineService: MagazineServiceInterface,
  ) {}

  async createMagazine(magazineRequest: MagazineCreateRequest): Promise<any> {
    try {
      return await this.magazineService.createMagazine(magazineRequest);
    } catch (error: any) {
      throw error;
    }
  }
}
