import { NoveltyRequest } from './dto/HTTP-REQUEST/novelty.request';
import { NoveltyUpdateRequest } from './dto/HTTP-REQUEST/novelty.update.request';
import { NoveltyResponse } from './dto/HTTP-RESPONSE/novelty.response';

export interface NoveltyAdapterInterface {
  createNovelty(noveltyRequest: NoveltyRequest): Promise<NoveltyResponse>;
  getNoveltyById(id: string): Promise<NoveltyResponse | null>;
  getAllNovelties(): Promise<NoveltyResponse[]>;
  updateNoveltyById(noveltyRequest: NoveltyUpdateRequest): Promise<string>;
  deleteNoveltyById(id: string): Promise<string>;
}
