import { Inject } from '@nestjs/common';
import { NoveltyAdapterInterface } from '../../../application/adapter/novelty.adapter.interface';
import { NoveltyServiceInterface } from '../../../domain/service/novelty.service.interface';
import { NoveltyRequest } from '../../../application/adapter/dto/HTTP-REQUEST/novelty.request';
import { NoveltyUpdateRequest } from '../../../application/adapter/dto/HTTP-REQUEST/novelty.update.request';
import { NoveltyResponse } from '../../../application/adapter/dto/HTTP-RESPONSE/novelty.response';

export class NoveltyAdapter implements NoveltyAdapterInterface {
  constructor(
    @Inject('NoveltyServiceInterface')
    private readonly noveltyService: NoveltyServiceInterface,
  ) {}

  async createNovelty(noveltyRequest: NoveltyRequest): Promise<NoveltyResponse> {
    try {
      return await this.noveltyService.createNovelty(noveltyRequest);
    } catch (error: any) {
      throw error;
    }
  }

  async getNoveltyById(id: string): Promise<NoveltyResponse | null> {
    try {
      return await this.noveltyService.getNoveltyById(id);
    } catch (error: any) {
      throw error;
    }
  }

  async getAllNovelties(): Promise<NoveltyResponse[]> {
    try {
      return await this.noveltyService.getAllNovelties();
    } catch (error: any) {
      throw error;
    }
  }

  async updateNoveltyById(noveltyRequest: NoveltyUpdateRequest): Promise<string> {
    try {
      return await this.noveltyService.updateNoveltyById(noveltyRequest);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteNoveltyById(id: string): Promise<string> {
    try {
      return await this.noveltyService.deleteNoveltyById(id);
    } catch (error: any) {
      throw error;
    }
  }
}
