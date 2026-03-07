import { NoveltyRequest } from '../../application/adapter/dto/HTTP-REQUEST/novelty.request';
import { NoveltyUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/novelty.update.request';
import { NoveltyResponse } from '../../application/adapter/dto/HTTP-RESPONSE/novelty.response';

export interface NoveltyServiceInterface {
  createNovelty(noveltyRequest: NoveltyRequest): Promise<NoveltyResponse>;
  getNoveltyById(id: string): Promise<NoveltyResponse | null>;
  getAllNovelties(): Promise<NoveltyResponse[]>;
  updateNoveltyById(noveltyRequest: NoveltyUpdateRequest): Promise<string>;
  deleteNoveltyById(id: string): Promise<string>;
}
