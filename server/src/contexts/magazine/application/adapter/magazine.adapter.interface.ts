import { ObjectId } from 'mongoose';
import { MagazineCreateRequest } from './dto/HTTP-REQUEST/magazine.create.request';
import { MagazineResponse } from './dto/HTTP-RESPONSE/magazine.reponse';

export interface MagazineAdapterInterface {
  createMagazine(magazineRequest: MagazineCreateRequest): Promise<any>;
  findMagazineByMagazineId(
    userId: ObjectId,
  ): Promise<Partial<MagazineResponse> | null>;
}
