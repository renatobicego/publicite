import { Inject } from '@nestjs/common';
import { NoveltyServiceInterface } from '../../domain/service/novelty.service.interface';
import { NoveltyRepositoryInterface } from '../../domain/repository/novelty.repository.interface';
import { NoveltyRequest } from '../adapter/dto/HTTP-REQUEST/novelty.request';
import { NoveltyUpdateRequest } from '../adapter/dto/HTTP-REQUEST/novelty.update.request';
import { NoveltyResponse } from '../adapter/dto/HTTP-RESPONSE/novelty.response';
import { NoveltyEntity } from '../../domain/entity/novelty.entity';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

export class NoveltyService implements NoveltyServiceInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('NoveltyRepositoryInterface')
    private readonly noveltyRepository: NoveltyRepositoryInterface,
  ) {}

  async createNovelty(noveltyRequest: NoveltyRequest): Promise<NoveltyResponse> {
    try {
      this.logger.log('Creating novelty');
      const noveltyEntity = new NoveltyEntity({
        properties: noveltyRequest.properties,
        blocks: noveltyRequest.blocks,
      });
      return await this.noveltyRepository.createNovelty(noveltyEntity);
    } catch (error: any) {
      this.logger.error('Error creating novelty', error);
      throw error;
    }
  }

  async getNoveltyById(id: string): Promise<NoveltyResponse | null> {
    try {
      this.logger.log('Finding novelty by id: ' + id);
      return await this.noveltyRepository.getNoveltyById(id);
    } catch (error: any) {
      this.logger.error('Error getting novelty by id', error);
      throw error;
    }
  }

  async getAllNovelties(): Promise<NoveltyResponse[]> {
    try {
      this.logger.log('Finding all novelties');
      return await this.noveltyRepository.getAllNovelties();
    } catch (error: any) {
      this.logger.error('Error getting all novelties', error);
      throw error;
    }
  }

  async updateNoveltyById(noveltyRequest: NoveltyUpdateRequest): Promise<string> {
    try {
      this.logger.log('Updating novelty by id: ' + noveltyRequest._id);
      return await this.noveltyRepository.updateNoveltyById(noveltyRequest);
    } catch (error: any) {
      this.logger.error('Error updating novelty by id', error);
      throw error;
    }
  }

  async deleteNoveltyById(id: string): Promise<string> {
    try {
      this.logger.log('Deleting novelty by id: ' + id);
      await this.noveltyRepository.deleteNoveltyById(id);
      return 'Novelty deleted successfully';
    } catch (error: any) {
      this.logger.error('Error deleting novelty by id', error);
      throw error;
    }
  }
}
