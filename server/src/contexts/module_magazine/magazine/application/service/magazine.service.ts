import { Inject } from '@nestjs/common';
import { MagazineServiceInterface } from '../../domain/service/magazine.service.interface';
import { MagazineCreateRequest } from '../adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineRepositoryInterface } from '../../domain/repository/magazine.repository.interface';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { MagazineSection } from '../../domain/entity/section/magazine.section.entity';
import { OwnerType } from '../../domain/entity/enum/magazine.ownerType.enum';
import { Magazine } from '../../domain/entity/magazine.entity';
import { ObjectId } from 'mongoose';
import { UserMagazine } from '../../domain/entity/user.magazine';
import { GroupMagazine } from '../../domain/entity/group.magazine';
import { MagazineResponse } from '../adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from '../adapter/dto/HTTP-REQUEST/magazine.update.request';
import { MagazineSectionCreateRequest } from '../adapter/dto/HTTP-REQUEST/magazineSection.create.request';

export class MagazineService implements MagazineServiceInterface {
  constructor(
    @Inject('MagazineRepositoryInterface')
    private readonly magazineRepository: MagazineRepositoryInterface,
    private readonly logger: MyLoggerService,
  ) {}
  async addNewMagazineSection(
    magazineAdmin: string,
    magazineId: string,
    section: MagazineSectionCreateRequest,
    groupId?: string,
  ): Promise<any> {
    try {
      this.logger.log('Adding new section in magazine...');
      await this.magazineRepository.addNewMagazineSection(
        magazineAdmin,
        magazineId,
        section,
        groupId,
      );
    } catch (error: any) {
      this.logger.error('Error adding new section in  Magazine');
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
      this.logger.log('Adding Post in Group Magazine in service..');
      await this.magazineRepository.addPostInGroupMagazine(
        postId,
        magazineId,
        magazineAdmin,
        sectionId,
      );
    } catch (error: any) {
      this.logger.error('Error adding Post in Group Magazine in service');
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
      this.logger.log('Adding Post in User Magazine in service..');
      await this.magazineRepository.addPostInUserMagazine(
        postId,
        magazineId,
        magazineAdmin,
        sectionId,
      );
    } catch (error: any) {
      this.logger.error('Error adding Post in User Magazine in service');
      throw error;
    }
  }

  async addAllowedCollaboratorsToGroupMagazine(
    newAllowedCollaborators: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any> {
    try {
      this.logger.log(
        'Adding Allowed Collaborators to User Magazine in service..',
      );
      await this.magazineRepository.addAllowedCollaboratorsToGroupMagazine(
        newAllowedCollaborators,
        magazineId,
        magazineAdmin,
      );
    } catch (error: any) {
      this.logger.error(
        'Error adding Allowed Collaborators to User Magazine in service',
        error,
      );
      throw error;
    }
  }

  async addCollaboratorsToUserMagazine(
    newCollaborators: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<void> {
    try {
      this.logger.log('Adding Collaborators to Group Magazine in service..');
      await this.magazineRepository.addCollaboratorsToUserMagazine(
        newCollaborators,
        magazineId,
        magazineAdmin,
      );
    } catch (error: any) {
      this.logger.error(
        'Error adding Collaborators to Group Magazine in service',
        error,
      );
      throw error;
    }
  }

  async createMagazine(magazineRequest: MagazineCreateRequest): Promise<void> {
    try {
      this.logger.log('Creating new Magazine in service..');
      const { addedPost } = magazineRequest;
      let section: any = [];
      const magazineBase = new Magazine(
        magazineRequest.name,
        section,
        magazineRequest.ownerType,
        magazineRequest.description ?? null,
        undefined,
      );
      if (addedPost != undefined || addedPost != null) {
        //La revista tiene un post, tenemos que proceder a crear la Magazine Section
        const newFatherSection = new MagazineSection(
          '',
          [addedPost as ObjectId],
          true,
        );
        section.push(newFatherSection);
        magazineBase.setSections = section;
      }

      switch (magazineRequest.ownerType) {
        case OwnerType.user: {
          this.logger.log('Creating new UserMagazine in service..');
          const userMagazine = new UserMagazine(
            magazineBase,
            magazineRequest.collaborators,
            magazineRequest.user,
            magazineRequest.visibility,
          );
          return await this.magazineRepository.save(userMagazine);
        }
        case OwnerType.group: {
          this.logger.log('Creating new GroupMagazine in service..');
          const groupMagazine = new GroupMagazine(
            magazineBase,
            magazineRequest.allowedCollaborators ?? [],
            magazineRequest.group,
          );
          return await this.magazineRepository.save(groupMagazine);
        }
      }
    } catch (error: any) {
      this.logger.error('Error creating new Magazine in service', error);
      throw error;
    }
  }

  async deleteCollaboratorsFromMagazine(
    collaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<void> {
    try {
      this.logger.log('Deleting Collaborators from Magazine in service..');
      await this.magazineRepository.deleteCollaboratorsFromMagazine(
        collaboratorsToDelete,
        magazineId,
        magazineAdmin,
      );
    } catch (error: any) {
      this.logger.error('Error deleting Collaborators from Magazine in service');
      throw error;
    }
  }

  async deleteAllowedCollaboratorsFromMagazineGroup(
    allowedCollaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any> {
    try {
      this.logger.log(
        'Deleting allowedCollaborators from Magazine in service..',
      );
      await this.magazineRepository.deleteAllowedCollaboratorsFromMagazineGroup(
        allowedCollaboratorsToDelete,
        magazineId,
        magazineAdmin,
      );
    } catch (error: any) {
      this.logger.error(
        'Error deleting  Allowedolaborators from Magazine in service',
      );
      throw error;
    }
  }

  async deleteSectionFromMagazineById(
    sectionIdsToDelete: string[],
    magazineId: string,
    allowedCollaboratorId?: string,
    userMagazineAllowed?: string,
  ): Promise<void> {
    try {
      if (!allowedCollaboratorId && userMagazineAllowed) {
        this.logger.log('Deleting Section from User Magazine in service..');
        return this.magazineRepository.deleteSectionFromUserMagazineById(
          sectionIdsToDelete,
          magazineId,
          userMagazineAllowed,
        );
      } else if (allowedCollaboratorId) {
        this.logger.log('Deleting Section from Group Magazine in service..');
        return this.magazineRepository.deleteSectionFromGroupMagazineById(
          sectionIdsToDelete,
          magazineId,
          allowedCollaboratorId,
        );
      } else {
        throw new Error('Not allowed');
      }
    } catch (error: any) {
      throw error;
    }
  }

  async findMagazineByMagazineId(
    id: ObjectId,
  ): Promise<Partial<MagazineResponse> | null> {
    this.logger.log('Finding user Magazines, user ID: ' + id);
    try {
      return await this.magazineRepository.findMagazineByMagazineId(id);
    } catch (error: any) {
      this.logger.error('Error finding new Magazine in service', error);
      throw error;
    }
  }

  async updateMagazineById(
    magazineRequest: MagazineUpdateRequest,
    owner: string,
    groupId?: string,
  ): Promise<any> {
    try {
      return await this.magazineRepository.updateMagazineById(
        magazineRequest,
        owner,
        groupId,
      );
    } catch (error: any) {
      throw error;
    }
  }
}
