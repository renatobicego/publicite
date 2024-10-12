import { Inject } from '@nestjs/common';
import { ObjectId } from 'mongoose';

import { MagazineCreateRequest } from 'src/contexts/magazine/application/adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineUpdateRequest } from 'src/contexts/magazine/application/adapter/dto/HTTP-REQUEST/magazine.update.request';
import { MagazineResponse } from 'src/contexts/magazine/application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
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

  async findMagazineByMagazineId(
    id: ObjectId,
  ): Promise<Partial<MagazineResponse> | null> {
    try {
      return await this.magazineService.findMagazineByMagazineId(id);
    } catch (error: any) {
      throw error;
    }
  }

  async updateMagazineById(
    magazineRequest: MagazineUpdateRequest,
  ): Promise<any> {
    try {
      return await this.magazineService.updateMagazineById(magazineRequest);
    } catch (error: any) {
      throw error;
    }
  }
}
