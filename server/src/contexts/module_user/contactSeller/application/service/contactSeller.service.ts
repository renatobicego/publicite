import { Inject } from '@nestjs/common';
import { ContactSellerServiceInterface } from '../../domain/service/contactSeller.service.interface';
import { ContactSeller } from '../../domain/contactSeller.entity';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { ContactSellerRepositoryInterface } from '../../domain/repository/contactSeller.repository.interface';
import { ContactSellerGetType } from '../../domain/model/contactSeller.model';

export class ContactSellerService implements ContactSellerServiceInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('ContactSellerRepositoryInterface')
    private readonly contactSellerRepository: ContactSellerRepositoryInterface,
  ) { }

  async createContactSeller(contactSeller: ContactSeller): Promise<boolean> {
    try {
      this.logger.log(
        'Creating contactSeller in adapter: ' + ContactSellerService.name,
      );
      return await this.contactSellerRepository.save(contactSeller);
    } catch (error: any) {
      throw error;
    }
  }

  async getContactSellerById(
    contactSellerGetType: ContactSellerGetType,
    _id: string,
    limit: number,
    page: number,
  ): Promise<any> {
    try {
      this.logger.log('Finding contactSeller: ' + contactSellerGetType);
      let conditon: {};
      if (limit <= 0) limit = 10
      if (page <= 0) page = 1
      switch (contactSellerGetType) {
        case ContactSellerGetType.post:
          conditon = { post: _id };
          break;
        case ContactSellerGetType.profile:
          conditon = { owner: _id };
          break;
        default:
          throw new Error(
            'Invalid contactSellerGetType: ' + contactSellerGetType,
          );
      }

      return await this.contactSellerRepository.getContactSellerById(conditon, limit, page);
    } catch (error: any) {
      throw error;
    }
  }

  async setOpinionRequestInTrue(_id: any): Promise<any> {
    try {
      await this.contactSellerRepository.setOpinionRequestInTrue(_id);
    } catch (error: any) {
      throw error;
    }
  }
}
