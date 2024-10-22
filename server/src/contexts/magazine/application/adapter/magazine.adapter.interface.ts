import { ObjectId } from 'mongoose';
import { MagazineCreateRequest } from './dto/HTTP-REQUEST/magazine.create.request';
import { MagazineResponse } from './dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from './dto/HTTP-REQUEST/magazine.update.request';

export interface MagazineAdapterInterface {
  addCollaboratorsToMagazine(
    newColaborators: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any>;

  deleteCollaboratorsFromMagazine(
    colaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any>;

  createMagazine(magazineRequest: MagazineCreateRequest): Promise<any>;
  findMagazineByMagazineId(
    userId: ObjectId,
  ): Promise<Partial<MagazineResponse> | null>;
  updateMagazineById(magazineRequest: MagazineUpdateRequest): Promise<any>;
}

// deleteAllowedCollaboratorsFromMagazine(
//   allowedCollaboratorsToDelete: string[],
//   magazineId: string,
// ): Promise<any>;

// addAllowedCollaboratorsToMagazine(
//   newAllowedCollaborators: string[],
//   magazineId: string,
// ): Promise<any>;
