import { Inject } from '@nestjs/common';
import { ObjectId } from 'mongoose';

import { MagazineCreateRequest } from 'src/contexts/module_magazine/magazine/application/adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineUpdateRequest } from 'src/contexts/module_magazine/magazine/application/adapter/dto/HTTP-REQUEST/magazine.update.request';
import { MagazineSectionCreateRequest } from 'src/contexts/module_magazine/magazine/application/adapter/dto/HTTP-REQUEST/magazineSection.create.request';
import { MagazineResponse } from 'src/contexts/module_magazine/magazine/application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineAdapterInterface } from 'src/contexts/module_magazine/magazine/application/adapter/magazine.adapter.interface';
import { MagazineServiceInterface } from 'src/contexts/module_magazine/magazine/domain/service/magazine.service.interface';

export class MagazineAdapter implements MagazineAdapterInterface {
  constructor(
    @Inject('MagazineServiceInterface')
    private readonly magazineService: MagazineServiceInterface,
  ) { }


  async addNewMagazineSection(
    magazineAdmin: string,
    magazineId: string,
    section: MagazineSectionCreateRequest,
    groupId?: string,
  ): Promise<any> {
    try {
      await this.magazineService.addNewMagazineSection(
        magazineAdmin,
        magazineId,
        section,
        groupId,
      );
    } catch (error: any) {
      throw error;
    }
  }
  async addPostInGroupMagazine(
    postId: string,
    magazineId: string,
    magazineAdmin: string,
    sectionId: string,
  ): Promise<any> {
    try {
      await this.magazineService.addPostInGroupMagazine(
        postId,
        magazineId,
        magazineAdmin,
        sectionId,
      );
    } catch (error: any) {
      throw error;
    }
  }
  async addPostInUserMagazine(
    postId: string,
    magazineId: string,
    magazineAdmin: string,
    sectionId: string,
  ): Promise<any> {
    try {
      await this.magazineService.addPostInUserMagazine(
        postId,
        magazineId,
        magazineAdmin,
        sectionId,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async addCollaboratorsToUserMagazine(
    newCollaborators: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any> {
    try {
      await this.magazineService.addCollaboratorsToUserMagazine(
        newCollaborators,
        magazineId,
        magazineAdmin,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async addAllowedCollaboratorsToGroupMagazine(
    newAllowedCollaborators: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any> {
    try {
      await this.magazineService.addAllowedCollaboratorsToGroupMagazine(
        newAllowedCollaborators,
        magazineId,
        magazineAdmin,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async createMagazine(magazineRequest: MagazineCreateRequest, userRequestId: string): Promise<any> {
    try {
      return await this.magazineService.createMagazine(magazineRequest, userRequestId);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteCollaboratorsFromMagazine(
    collaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any> {
    try {
      await this.magazineService.deleteCollaboratorsFromMagazine(
        collaboratorsToDelete,
        magazineId,
        magazineAdmin,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async deleteSectionFromMagazineById(
    sectionIdsToDelete: string[],
    magazineId: string,
    magazineType: string,
    userRequestId: string,
  ): Promise<any> {
    try {
      switch (magazineType) {
        case 'group':
          await this.magazineService.deleteSectionFromMagazineGroupById(
            sectionIdsToDelete,
            magazineId,
            userRequestId,
          );
          break;
        case 'user':
          await this.magazineService.deleteSectionFromMagazineUserById(
            sectionIdsToDelete,
            magazineId,
            userRequestId,
          );
          break;
        default:
          return 'You are not allowed to delete this section';

      }

    } catch (error: any) {
      throw error;
    }
  }
  async deleteAllowedCollaboratorsFromMagazineGroup(
    allowedCollaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any> {
    try {
      await this.magazineService.deleteAllowedCollaboratorsFromMagazineGroup(
        allowedCollaboratorsToDelete,
        magazineId,
        magazineAdmin,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async deletePostInMagazineSection(postIdToRemove: string, sectionId: string, ownerType: string, userRequestId: string, magazineId?: string): Promise<any> {
    try {
      await this.magazineService.deletePostInMagazineSection(postIdToRemove, sectionId, ownerType, userRequestId, magazineId);
    } catch (error: any) {
      throw error;
    }
  }

  async findMagazineByMagazineId(
    id: ObjectId,
  ): Promise<Partial<MagazineResponse> | null> {
    try {
      return await this.magazineService.findMagazineByMagazineId(id);
    } catch (error: any) {
      throw error;
    }
  }


  async findAllMagazinesByUserId(userId: string): Promise<MagazineResponse[] | []> {
    try {
      return await this.magazineService.findAllMagazinesByUserId(userId);
    } catch (error: any) {
      throw error;
    }
  }

  async updateMagazineById(
    magazineRequest: MagazineUpdateRequest,
    owner: string,
    groupId?: string,
  ): Promise<any> {
    try {
      return await this.magazineService.updateMagazineById(
        magazineRequest,
        owner,
        groupId,
      );
    } catch (error: any) {
      throw error;
    }
  }


  async updateTitleOfSectionById(sectionId: string, newTitle: string, userRequestId: string, ownerType: string, magazineId?: string): Promise<any> {
    try {
      await this.magazineService.updateTitleOfSectionById(sectionId, newTitle, userRequestId, ownerType, magazineId);
    } catch (error: any) {
      throw error;
    }
  }
}
