import { NoveltyEntity } from '../entity/novelty.entity';
import { NoveltyUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/novelty.update.request';
import { NoveltyResponse } from '../../application/adapter/dto/HTTP-RESPONSE/novelty.response';

export interface NoveltyRepositoryInterface {
  createNovelty(novelty: NoveltyEntity): Promise<NoveltyResponse>;
  getNoveltyById(id: string): Promise<NoveltyResponse | null>;
  getAllNovelties(): Promise<NoveltyResponse[]>;
  updateNoveltyById(novelty: NoveltyUpdateRequest): Promise<string>;
  deleteNoveltyById(id: string): Promise<void>;
}
