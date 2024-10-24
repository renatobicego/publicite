import { ObjectId } from 'mongoose';

import { MagazineCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineResponse } from '../../application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.update.request';

export interface MagazineServiceInterface {
  addCollaboratorsToUserMagazine(
    newColaborators: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<void>;
  addAllowedCollaboratorsToGroupMagazine(
    newAllowedCollaborators: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any>;
  createMagazine(magazineRequest: MagazineCreateRequest): Promise<void>;
  deleteCollaboratorsFromMagazine(
    colaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<void>;
  deleteSectionFromMagazineById(
    sectionIdsToDelete: string[],
    allowedCollaboratorId?: string,
    userMagazineAllowed?: string,
  ): Promise<any>;


  deleteAllowedCollaboratorsFromMagazineGroup(
    allowedCollaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any>;

  findMagazineByMagazineId(
    userId: ObjectId,
  ): Promise<Partial<MagazineResponse> | null>;
  updateMagazineById(magazineRequest: MagazineUpdateRequest): Promise<any>;
}
