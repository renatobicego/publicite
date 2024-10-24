import { Inject } from '@nestjs/common';
import { ObjectId } from 'mongoose';

import { MagazineCreateRequest } from 'src/contexts/magazine/application/adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineUpdateRequest } from 'src/contexts/magazine/application/adapter/dto/HTTP-REQUEST/magazine.update.request';
import { MagazineResponse } from 'src/contexts/magazine/application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineAdapterInterface } from 'src/contexts/magazine/application/adapter/magazine.adapter.interface';
import { MagazineServiceInterface } from 'src/contexts/magazine/domain/service/magazine.service.interface';

export class MagazineAdapter implements MagazineAdapterInterface {
  constructor(
    @Inject('MagazineServiceInterface')
    private readonly magazineService: MagazineServiceInterface,
  ) {}
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
    newColaborators: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any> {
    try {
      await this.magazineService.addCollaboratorsToUserMagazine(
        newColaborators,
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

  async createMagazine(magazineRequest: MagazineCreateRequest): Promise<any> {
    try {
      return await this.magazineService.createMagazine(magazineRequest);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteCollaboratorsFromMagazine(
    colaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any> {
    try {
      await this.magazineService.deleteCollaboratorsFromMagazine(
        colaboratorsToDelete,
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
    allowedCollaboratorId?: string,
    userMagazineAllowed?: string,
  ): Promise<any> {
    try {
      if (!allowedCollaboratorId && userMagazineAllowed) {
        await this.magazineService.deleteSectionFromMagazineById(
          sectionIdsToDelete,
          magazineId,
          userMagazineAllowed,
        );
      } else if (allowedCollaboratorId) {
        await this.magazineService.deleteSectionFromMagazineById(
          sectionIdsToDelete,
          magazineId,
          allowedCollaboratorId,
        );
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

  async findMagazineByMagazineId(
    id: ObjectId,
  ): Promise<Partial<MagazineResponse> | null> {
    try {
      return await this.magazineService.findMagazineByMagazineId(id);
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
}
