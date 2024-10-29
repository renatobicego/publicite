import { ObjectId } from 'mongoose';

import { Magazine } from '../entity/magazine.entity';
import { MagazineResponse } from '../../application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.update.request';
import { MagazineSectionCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazineSection.create.request';

export interface MagazineRepositoryInterface {
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

  deleteCollaboratorsFromMagazine(
    collaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<void>;

  deleteAllowedCollaboratorsFromMagazineGroup(
    allowedCollaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any>;

  deleteSectionFromGroupMagazineById(
    sectionIdsToDelete: string[],
    magazineId: string,
    allowedCollaboratorId: string,
  ): Promise<void>;
  deleteSectionFromUserMagazineById(
    sectionIdsToDelete: string[],
    magazineId: string,
    allowedCollaboratorId: string,
  ): Promise<void>;
  save(magazine: Magazine): Promise<any>;
  saveMagazineWithSection(magazine: Magazine): Promise<any>;
  findMagazineByMagazineId(
    userId: ObjectId,
  ): Promise<Partial<MagazineResponse> | null>;
  updateMagazineById(
    magazine: MagazineUpdateRequest,
    owner: string,
    groupId?: string,
  ): Promise<any>;
}
