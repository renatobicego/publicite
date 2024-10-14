import { Inject } from '@nestjs/common';
import { MagazineServiceInterface } from '../../domain/service/magazine.service.interface';
import { MagazineCreateRequest } from '../adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineRepositoryInterface } from '../../domain/repository/magazine.repository.interface';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { MagazineSection } from '../../domain/entity/section/magazine.section.entity';
import { OwnerType } from '../../domain/entity/enum/magazine.ownerType.enum';
import { Magazine } from '../../domain/entity/magazine.entity';
import { ObjectId } from 'mongoose';
import { UserMagazine } from '../../domain/entity/user.magazine';
import { GroupMagazine } from '../../domain/entity/group.magazine';
import { MagazineResponse } from '../adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from '../adapter/dto/HTTP-REQUEST/magazine.update.request';

export class MagazineService implements MagazineServiceInterface {
  constructor(
    @Inject('MagazineRepositoryInterface')
    private readonly magazineRepository: MagazineRepositoryInterface,
    private readonly logger: MyLoggerService,
  ) {}
  async addAllowedCollaboratorsToMagazine(
    newAllowedCollaborators: string[],
    magazineId: string,
  ): Promise<any> {
    try {
      this.logger.log('Adding Allowed Colaborators to Magazine in service..');
      await this.magazineRepository.addAllowedCollaboratorsToMagazine(
        newAllowedCollaborators,
        magazineId,
      );
    } catch (error: any) {
      this.logger.error(
        'Error adding Allowed Colaborators to Magazine in service',
        error,
      );
      throw error;
    }
  }

  async addCollaboratorsToMagazine(
    newColaborators: string[],
    magazineId: string,
  ): Promise<void> {
    try {
      this.logger.log('Adding Colaborators to Magazine in service..');
      await this.magazineRepository.addCollaboratorsToMagazine(
        newColaborators,
        magazineId,
      );
    } catch (error: any) {
      this.logger.error(
        'Error adding Colaborators to Magazine in service',
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
            magazineRequest.allowedColaborators ?? [],
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
    colaboratorsToDelete: string[],
    magazineId: string,
  ): Promise<void> {
    try {
      this.logger.log('Deleting Colaborators from Magazine in service..');
      await this.magazineRepository.deleteCollaboratorsFromMagazine(
        colaboratorsToDelete,
        magazineId,
      );
    } catch (error: any) {
      this.logger.error('Error deleting Colaborators from Magazine in service');
      throw error;
    }
  }

  async deleteAllowedCollaboratorsFromMagazine(
    allowedCollaboratorsToDelete: string[],
    magazineId: string,
  ): Promise<any> {
    try {
      this.logger.log(
        'Deleting AllowedColaborators from Magazine in service..',
      );
      await this.magazineRepository.deleteAllowedCollaboratorsFromMagazine(
        allowedCollaboratorsToDelete,
        magazineId,
      );
    } catch (error: any) {
      this.logger.error(
        'Error deleting  Allowedolaborators from Magazine in service',
      );
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
  ): Promise<any> {
    try {
      return await this.magazineRepository.updateMagazineById(magazineRequest);
    } catch (error: any) {
      throw error;
    }
  }
}
