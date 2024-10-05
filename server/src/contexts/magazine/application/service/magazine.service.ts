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

export class MagazineService implements MagazineServiceInterface {
  constructor(
    @Inject('MagazineRepositoryInterface')
    private readonly magazineRepository: MagazineRepositoryInterface,
    private readonly logger: MyLoggerService,
  ) {}

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

      if (addedPost) {
        //La revista tiene un post, tenemos que proceder a crear la Magazine Section
        const newFatherSection = new MagazineSection('', [addedPost], true);
        section.push(newFatherSection);
        magazineBase.setSections = section;
      }

      switch (magazineRequest.ownerType) {
        case OwnerType.user: {
          this.logger.log('Creating new UserMagazine in service..');
          const userMagazine = new UserMagazine(
            magazineBase,
            magazineRequest.collaborators,
            magazineRequest.visibility,
          );
          await this.magazineRepository.save(userMagazine);
          break;
        }
        case OwnerType.group: {
          this.logger.log('Creating new GroupMagazine in service..');
          const groupMagazine = new GroupMagazine(
            magazineBase,
            magazineRequest.allowedColaborators ?? [],
            magazineRequest.group,
          );
          await this.magazineRepository.save(groupMagazine);
          break;
        }
      }
    } catch (error: any) {
      this.logger.error('Error creating new Magazine in service', error);
      throw error;
    }
  }

  async findMagazineByMagazineId(
    id: ObjectId,
  ): Promise<Partial<MagazineResponse>[] | []> {
    this.logger.log('Finding user Magazines, user ID: ' + id);
    try {
      return await this.magazineRepository.findMagazineByMagazineId(id);
    } catch (error: any) {
      this.logger.error('Error finding new Magazine in service', error);

      throw error;
    }
  }
}
