import { ObjectId } from 'mongoose';

import { MagazineCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineResponse } from '../../application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.update.request';
import { MagazineSectionCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazineSection.create.request';

export interface MagazineServiceInterface {
  addNewMagazineSection(
    magazineAdmin: string,
    magazineId: string,
    section: MagazineSectionCreateRequest,
    groupId?: string,
  ): Promise<any>;

  addPostInGroupMagazine(
    postId: string,
    magazineId: string,
    magazineAdmin: string,
    sectionId: string,
  ): Promise<any>;

  addPostInUserMagazine(
    postId: string,
    magazineId: string,
    magazineAdmin: string,
    sectionId: string,
  ): Promise<any>;

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
  updateMagazineById(
    magazineRequest: MagazineUpdateRequest,
    owner: string,
    groupId?: string,
  ): Promise<any>;
}
