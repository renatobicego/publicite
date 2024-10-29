import { Injectable, Inject } from '@nestjs/common';
import { ClientSession, Types } from 'mongoose';

import { ContactServiceInterface } from '../../domain/service/contact.service.interface';
import { ContactRepositoryInterface } from '../../domain/repository/contact.repository.interface';
import { Contact } from '../../domain/entity/contact.entity';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { ContactRequest } from 'src/contexts/module_user/user/application/adapter/dto/HTTP-REQUEST/user.request.CREATE';

@Injectable()
export class ContactService implements ContactServiceInterface {
  constructor(
    @Inject('ContactRepositoryInterface')
    private readonly contactRepository: ContactRepositoryInterface,
    private logger: MyLoggerService,
  ) {}

  async createContact(
    contact: ContactRequest,
    options?: { session?: ClientSession },
  ): Promise<Types.ObjectId> {
    try {
      this.logger.log('Creating contact in service: ' + ContactService.name);
      const contactMapped = new Contact(
        contact.phone ?? '',
        contact.instagram ?? '',
        contact.facebook ?? '',
        contact.x ?? '',
        contact.website ?? '',
      );
      return await this.contactRepository.createContact(contactMapped, options);
    } catch (error) {
      throw error;
    }
  }
}
