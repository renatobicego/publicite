import { ObjectId } from 'mongoose';
import { MagazineCreateRequest } from './dto/HTTP-REQUEST/magazine.create.request';
import { MagazineResponse } from './dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from './dto/HTTP-REQUEST/magazine.update.request';

export interface MagazineAdapterInterface {
  createMagazine(magazineRequest: MagazineCreateRequest): Promise<any>;
  findMagazineByMagazineId(
    userId: ObjectId,
  ): Promise<Partial<MagazineResponse> | null>;
  updateMagazineById(magazineRequest: MagazineUpdateRequest): Promise<any>;
}
