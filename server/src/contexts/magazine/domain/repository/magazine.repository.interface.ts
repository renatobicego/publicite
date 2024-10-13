import { ObjectId } from 'mongoose';

import { Magazine } from '../entity/magazine.entity';
import { MagazineResponse } from '../../application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.update.request';

export interface MagazineRepositoryInterface {
  addCollaboratorsToMagazine(
    newColaborators: string[],
    magazineId: string,
  ): Promise<void>;
  addAllowedCollaboratorsToMagazine(
    newAllowedCollaborators: string[],
    magazineId: string,
  ): Promise<any>;
  deleteCollaboratorsFromMagazine(
    colaboratorsToDelete: string[],
    magazineId: string,
  ): Promise<void>;
  deleteAllowedCollaboratorsFromMagazine(
    allowedCollaboratorsToDelete: string[],
    magazineId: string,
  ): Promise<any>;
  save(magazine: Magazine): Promise<any>;
  saveMagazineWithSection(magazine: Magazine): Promise<any>;
  findMagazineByMagazineId(
    userId: ObjectId,
  ): Promise<Partial<MagazineResponse> | null>;
  updateMagazineById(magazine: MagazineUpdateRequest): Promise<any>;
}
