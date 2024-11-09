import { ObjectId } from 'mongoose';

import { Magazine } from '../entity/magazine.entity';
import { MagazineResponse } from '../../application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.update.request';
import { MagazineSectionCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazineSection.create.request';
import { MagazineSection } from '../entity/section/magazine.section.entity';

export interface MagazineRepositoryInterface {
  addNewMagazineGroupSection(
    magazineId: string,
    section: MagazineSectionCreateRequest,
  ): Promise<any>;

  addNewMagazineUserSection(
    magazineId: string,
    section: MagazineSectionCreateRequest,
    magazineAdmin: string
  ): Promise<any>;

  addPostInGroupMagazine(
    postId: string,
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

  deletePostInMagazineSection(
    postIdToRemove: string,
    sectionId: string): Promise<any>;
  isUserAllowedToEditSectionUserMagazine(
    sectionId: string,
    userId: string,

  ): Promise<boolean>;

  isUserAllowedToEditSectionGroupMagazine(
    sectionId: string,
    userId: string,
    magazineId: string
  ): Promise<boolean>;
  isAdminOrCollaborator(magazineId: string, userId: string): Promise<boolean>
  save(magazine: Magazine): Promise<any>;
  saveMagazineWithSection(magazine: Magazine): Promise<any>;
  saveSection(section: MagazineSectionCreateRequest, session: any): Promise<any>
  findMagazineByMagazineId(
    userId: ObjectId,
  ): Promise<Partial<MagazineResponse> | null>;

  findAllMagazinesByUserId(userId: string): Promise<MagazineResponse[] | []>;
  updateMagazineById(
    magazine: MagazineUpdateRequest,
    owner: string,
    groupId?: string,
  ): Promise<any>;

  updateTitleOfSectionById(
    sectionId: string,
    newTitle: string,
    userRequestId: string,
  ): Promise<void>;
}
