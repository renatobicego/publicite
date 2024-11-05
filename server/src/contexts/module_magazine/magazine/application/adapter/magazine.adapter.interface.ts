import { ObjectId } from 'mongoose';
import { MagazineCreateRequest } from './dto/HTTP-REQUEST/magazine.create.request';
import { MagazineResponse } from './dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from './dto/HTTP-REQUEST/magazine.update.request';
import { MagazineSectionCreateRequest } from './dto/HTTP-REQUEST/magazineSection.create.request';

export interface MagazineAdapterInterface {
  addNewMagazineSection(
    magazineAdmin: string,
    magazineId: string,
    section: MagazineSectionCreateRequest,
    groupId?: string,
  ): Promise<any>;

  addCollaboratorsToUserMagazine(
    newCollaborators: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any>;

  addAllowedCollaboratorsToGroupMagazine(
    newAllowedCollaborators: string[],
    magazineId: string,
    magazineAdmin: string,
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

  deleteCollaboratorsFromMagazine(
    collaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any>;
  deleteSectionFromMagazineById(
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
  createMagazine(magazineRequest: MagazineCreateRequest): Promise<any>;
  findMagazineByMagazineId(
    userId: ObjectId,
  ): Promise<Partial<MagazineResponse> | null>;

  findAllMagazinesByUserId(
    userId: string): Promise<MagazineResponse[] | []>;

  updateMagazineById(
    magazineRequest: MagazineUpdateRequest,
    owner: string,
    groupId?: string,
  ): Promise<any>;

  updateTitleOfSectionById(
    sectionId: string,
    newTitle: string,
    userRequestId: string,
    ownerType: string,
    magazineId?: string
  ): Promise<any>
}
