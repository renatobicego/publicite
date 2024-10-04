import { Inject } from '@nestjs/common';
import { MagazineServiceInterface } from '../../domain/service/magazine.service.interface';
import { MagazineCreateRequest } from '../adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineRepositoryInterface } from '../../domain/repository/magazine.repository.interface';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { MagazineSection } from '../../domain/entity/section/magazine.section.entity';
import { OwnerType } from '../../domain/entity/enum/magazine.ownerType.enum';
import { Magazine } from '../../domain/entity/magazine.entity';

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
      let newFatherSection = undefined;
      //Aca tenemos dos caminos
      //1. Corroborar si viene una revista con un addedPost, si viene un addedPost creamos una seccion

      if (addedPost) {
        //La revista tiene un post, tenemos que proceder a crear la Magazine Section
        newFatherSection = new MagazineSection('', [addedPost], true);
      }
      //   const magazineBase = new Magazine(
      //     magazineRequest.name,
      //   [newFatherSection] ?? [],
      //     magazineRequest.ownerType,
      //     magazineRequest.description,
      //     null,
      //   );
      switch (magazineRequest.ownerType) {
        case OwnerType.user: {
        }
        case OwnerType.group: {
        }
      }
    } catch (error: any) {
      this.logger.error('Error creating new Magazine in service', error);
      throw error;
    }
  }
}
