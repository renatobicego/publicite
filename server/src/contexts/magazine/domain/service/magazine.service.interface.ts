import { ObjectId } from 'mongoose';

import { MagazineCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineResponse } from '../../application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.update.request';

export interface MagazineServiceInterface {
  addCollaboratorsToMagazine(
    newColaborators: string[],
    magazineId: string,
  ): Promise<void>;
  // addAllowedCollaboratorsToMagazine(
  //   newAllowedCollaborators: string[],
  //   magazineId: string,
  // ): Promise<any>;
  createMagazine(magazineRequest: MagazineCreateRequest): Promise<void>;
  deleteCollaboratorsFromMagazine(
    colaboratorsToDelete: string[],
    magazineId: string,
  ): Promise<void>;

  // deleteAllowedCollaboratorsFromMagazine(
  //   allowedCollaboratorsToDelete: string[],
  //   magazineId: string,
  // ): Promise<any>;

  findMagazineByMagazineId(
    userId: ObjectId,
  ): Promise<Partial<MagazineResponse> | null>;
  updateMagazineById(magazineRequest: MagazineUpdateRequest): Promise<any>;
}
