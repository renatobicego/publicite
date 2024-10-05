import { ObjectId } from 'mongoose';

import { MagazineCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineResponse } from '../../application/adapter/dto/HTTP-RESPONSE/magazine.reponse';

export interface MagazineServiceInterface {
  createMagazine(magazineRequest: MagazineCreateRequest): Promise<void>;
  findMagazineByMagazineId(userId: ObjectId): Promise<Partial<MagazineResponse>[] | []>;
}
