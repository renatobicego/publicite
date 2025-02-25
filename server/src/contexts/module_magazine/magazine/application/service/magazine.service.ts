import { BadRequestException, Inject } from '@nestjs/common';
import { ObjectId } from 'mongoose';



import { MagazineServiceInterface } from '../../domain/service/magazine.service.interface';
import { MagazineCreateRequest } from '../adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineRepositoryInterface } from '../../domain/repository/magazine.repository.interface';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { MagazineSection } from '../../domain/entity/section/magazine.section.entity';
import { OwnerType } from '../../domain/entity/enum/magazine.ownerType.enum';
import { Magazine } from '../../domain/entity/magazine.entity';
import { UserMagazine } from '../../domain/entity/user.magazine';
import { GroupMagazine } from '../../domain/entity/group.magazine';
import { MagazineResponse } from '../adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from '../adapter/dto/HTTP-REQUEST/magazine.update.request';
import { MagazineSectionCreateRequest } from '../adapter/dto/HTTP-REQUEST/magazineSection.create.request';
import { UserMagazineAllowedVerificationsInterface } from '../../domain/repository/user.allowed.verifications.interface';

export class MagazineService implements MagazineServiceInterface {
  constructor(
    @Inject('MagazineRepositoryInterface')
    private readonly magazineRepository: MagazineRepositoryInterface,
    @Inject('UserMagazineAllowedVerificationsInterface')
    private readonly userMagazineAllowedVerifications: UserMagazineAllowedVerificationsInterface,
    private readonly logger: MyLoggerService,

  ) { }

  async deletePostInMagazineWithEmitter(postId: string) {
    try {
      await this.magazineRepository.deletePostInMagazine(postId);
    } catch (error: any) {
      throw error;
    }
  }
  async addNewMagazineSection(
    magazineAdmin: string,
    magazineId: string,
    section: MagazineSectionCreateRequest,
    groupId?: string,
  ): Promise<any> {
    try {
      this.logger.log('Adding new section in magazine...');
      if (groupId) {
        this.logger.log('Adding new section in group magazine...');
        await this.userMagazineAllowedVerifications.is_admin_creator_or_collaborator_of_magazine_GROUP_MAGAZINE(
          magazineId,
          magazineAdmin,
        )
        return this.magazineRepository.addNewMagazineGroupSection(
          magazineId,
          section
        )
      }

      return this.magazineRepository.addNewMagazineUserSection(
        magazineId,
        section,
        magazineAdmin
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
      await this.userMagazineAllowedVerifications.is_admin_creator_or_collaborator_of_magazine_GROUP_MAGAZINE(
        magazineId,
        magazineAdmin,
      );

      await this.magazineRepository.addPostInGroupMagazine(
        postId,
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
    session: any
  ): Promise<any> {
    try {
      this.logger.log(
        'Adding Allowed Collaborators to User Magazine in service..',
      );
      await this.magazineRepository.addAllowedCollaboratorsToGroupMagazine(
        newAllowedCollaborators,
        magazineId,
        magazineAdmin,
        session,
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
    session: any
  ): Promise<void> {
    try {
      this.logger.log('Adding Collaborators to Group Magazine in service..');
      await this.magazineRepository.addCollaboratorsToUserMagazine(
        newCollaborators,
        magazineId,
        magazineAdmin,
        session,
      );
    } catch (error: any) {
      this.logger.error(
        'Error adding Collaborators to Group Magazine in service',
        error,
      );
      throw error;
    }
  }

  async createMagazine(magazineRequest: MagazineCreateRequest, userRequestId: string): Promise<void> {
    try {
      this.logger.log('Creating new Magazine in service..');
      const postArray = [];
      const { addedPost } = magazineRequest;
      if (addedPost) postArray.push(addedPost)
      let section: any = [];
      const magazineBase = new Magazine(
        magazineRequest.name,
        section,
        magazineRequest.ownerType,
        magazineRequest.description ?? null,
        undefined,
      );

      const newFatherSection = new MagazineSection(
        '',
        postArray,
        true,
      );
      section.push(newFatherSection);
      magazineBase.setSections = section;


      switch (magazineRequest.ownerType) {
        case OwnerType.user: {
          this.logger.log('Creating new UserMagazine in service..');
          const userMagazine = new UserMagazine(
            magazineBase,
            magazineRequest.collaborators ?? [],
            userRequestId,
            magazineRequest.visibility ?? "public",
          );
          return await this.magazineRepository.save(userMagazine);
        }
        case OwnerType.group: {
          const allowedCollaborators: string[] = []
          allowedCollaborators.push(userRequestId)
          this.logger.log('Creating new GroupMagazine in service..');
          const groupMagazine = new GroupMagazine(
            magazineBase,
            allowedCollaborators,
            magazineRequest.group!!,
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
    session: any
  ): Promise<void> {
    try {
      this.logger.log('Deleting Collaborators from Magazine in service..');
      await this.magazineRepository.deleteCollaboratorsFromMagazine(
        collaboratorsToDelete,
        magazineId,
        magazineAdmin,
        session,
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
    session: any
  ): Promise<any> {
    try {
      this.logger.log(
        'Deleting allowedCollaborators from Magazine in service..',
      );
      await this.magazineRepository.deleteAllowedCollaboratorsFromMagazineGroup(
        allowedCollaboratorsToDelete,
        magazineId,
        magazineAdmin,
        session,
      );
    } catch (error: any) {
      this.logger.error(
        'Error deleting  Allowedolaborators from Magazine in service',
      );
      throw error;
    }
  }

  async deleteSectionFromMagazineGroupById(
    sectionIdsToDelete: string[],
    magazineId: string,
    allowedCollaboratorId: string,
  ): Promise<void> {
    try {
      await this.userMagazineAllowedVerifications.is_admin_creator_or_collaborator_of_magazine_GROUP_MAGAZINE(
        magazineId,
        allowedCollaboratorId
      )
      return await this.magazineRepository.deleteSectionFromGroupMagazineById
        (
          sectionIdsToDelete,
          magazineId,
        );
    } catch (error: any) {
      throw error;
    }
  }

  async deleteSectionFromMagazineUserById(
    sectionIdsToDelete: string[],
    magazineId: string,
    userMagazineAllowed: string,
  ): Promise<void> {
    try {
      return await this.magazineRepository.deleteSectionFromUserMagazineById(
        sectionIdsToDelete,
        magazineId,
        userMagazineAllowed,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async deleteMagazineByMagazineId(magazineId: string, userRequestId: string, ownerType: string): Promise<any> {
    let isUserAllowedToDelete = false;
    try {
      switch (ownerType.toLowerCase()) {
        case OwnerType.user: {
          isUserAllowedToDelete = await this.userMagazineAllowedVerifications.is_creator_of_magazine_USER_MAGAZINE(magazineId, userRequestId)
          if (isUserAllowedToDelete) {
            this.logger.log('You are allowed to delete this magazine');
            return this.magazineRepository.deleteMagazineByMagazineId(magazineId)
          } else {
            return 'You are not allowed to delete this magazine'
          }

        }
        case OwnerType.group: {
          isUserAllowedToDelete = await this.userMagazineAllowedVerifications.is_admin_or_creator_of_magazine_GROUP_MAGAZINE(magazineId, userRequestId)
          if (isUserAllowedToDelete) {
            this.logger.log('You are allowed to delete this magazine');
            return this.magazineRepository.deleteMagazineByMagazineId(magazineId)
          } else {
            return 'You are not allowed to delete this magazine'
          }

        }
        default: {
          throw new BadRequestException('Invalid owner type - check owner type Magazine in request');
        }

      }
    } catch (error: any) {
      throw error;
    }
  }


  async deletePostInMagazineSection(postIdToRemove: string, sectionId: string, ownerType: string, userRequestId: string, magazineId?: string): Promise<any> {

    try {
      const isUserAllowed = await this.isUserAllowedToModifySection(sectionId, userRequestId, ownerType, magazineId);
      if (!isUserAllowed) return
      return await this.magazineRepository.deletePostInMagazineSection(postIdToRemove, sectionId);

    } catch (error: any) {
      this.logger.error('Error removing post of section', error);
      throw error;
    }

  }

  async exitMagazineByMagazineId(magazineId: string, userRequestId: string, ownerType: string): Promise<any> {
    try {

      switch (ownerType.toLowerCase()) {
        case OwnerType.user: {
          this.logger.log('Exiting from Magazine.. (userMagazine)');
          return await this.magazineRepository.removeCollaboratorFromUserMagazine(magazineId, userRequestId);
        }
        case OwnerType.group: {
          this.logger.log('Exiting from Magazine.. (groupMagazine)');
          return await this.magazineRepository.removeAllowedCollaboratorFromGroupMagazine(magazineId, userRequestId);
        }
        default: {
          throw new BadRequestException('Invalid owner type - check owner type Magazine in request');
        }
      }

    }
    catch (error: any) {
      this.logger.error('Error removing collaborator of Magazine', error);
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

  async findAllMagazinesByUserId(userId: string): Promise<MagazineResponse[] | []> {
    try {
      return this.magazineRepository.findAllMagazinesByUserId(userId)
    } catch (error: any) {
      this.logger.error('Error finding new Magazine in service', error);
      throw error;
    }
  }

  async isUserAllowedToModifySection(sectionId: string, userRequestId: string, ownerType: string, magazineId?: string): Promise<any> {
    let isUserAllowed = false;
    switch (ownerType) {
      case OwnerType.user: {
        isUserAllowed = await this.userMagazineAllowedVerifications.is_user_allowed_to_edit_section_USER_MAGAZINE(sectionId, userRequestId);
        break;
      }
      case OwnerType.group: {
        if (!magazineId) return false
        isUserAllowed = await this.userMagazineAllowedVerifications.is_user_allowed_to_edit_section_GROUP_MAGAZINE(sectionId, userRequestId, magazineId);
        break
      }
      default: {
        throw new Error('Please select a valid owner type');
      }
    }
    if (!isUserAllowed) throw new Error('User not allowed to update this section');
    return isUserAllowed;
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

  async updateTitleOfSectionById(sectionId: string, newTitle: string, userRequestId: string, ownerType: string, magazineId?: string): Promise<any> {
    try {
      const isUserAllowed = await this.isUserAllowedToModifySection(sectionId, userRequestId, ownerType, magazineId);
      if (!isUserAllowed) return
      return await this.magazineRepository.updateTitleOfSectionById(sectionId, newTitle, userRequestId);
    } catch (error: any) {
      this.logger.error('Error updating Title of section', error);
      throw error;
    }
  }

}
