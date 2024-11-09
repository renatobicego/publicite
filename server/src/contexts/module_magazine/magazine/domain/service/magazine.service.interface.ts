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
    newCollaborators: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<void>;
  addAllowedCollaboratorsToGroupMagazine(
    newAllowedCollaborators: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any>;
  createMagazine(magazineRequest: MagazineCreateRequest, userRequestId: string): Promise<void>;
  deleteCollaboratorsFromMagazine(
    collaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<void>;
  deleteSectionFromMagazineUserById(
    sectionIdsToDelete: string[],
    magazineId: string,
    allowedCollaboratorId?: string,
    userMagazineAllowed?: string,
  ): Promise<any>;

  deleteSectionFromMagazineGroupById(
    sectionIdsToDelete: string[],
    magazineId: string,
    allowedCollaboratorId?: string,
    userMagazineAllowed?: string,
  ): Promise<any>;

  deleteAllowedCollaboratorsFromMagazineGroup(
    allowedCollaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any>;

  deletePostInMagazineSection(postIdToRemove: string, sectionId: string, ownerType: string, userRequestId: string, magazineId?: string): Promise<any>;

  findMagazineByMagazineId(
    userId: ObjectId,
  ): Promise<Partial<MagazineResponse> | null>;

  findAllMagazinesByUserId(
    userId: string,
  ): Promise<MagazineResponse[] | []>;
  updateMagazineById(
    magazineRequest: MagazineUpdateRequest,
    owner: string,
    groupId?: string,
  ): Promise<any>;

  updateTitleOfSectionById(sectionId: string, newTitle: string, userRequestId: string, ownerType: string, magazineId?: string): Promise<any>;
}
