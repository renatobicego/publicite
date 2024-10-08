import { ObjectId } from 'mongoose';

import { Magazine } from '../entity/magazine.entity';
import { MagazineResponse } from '../../application/adapter/dto/HTTP-RESPONSE/magazine.reponse';

export interface MagazineRepositoryInterface {
  save(magazine: Magazine): Promise<any>;
  saveMagazineWithSection(magazine: Magazine): Promise<any>;
  findMagazineByMagazineId(
    userId: ObjectId,
  ): Promise<Partial<MagazineResponse> | null>;
}
