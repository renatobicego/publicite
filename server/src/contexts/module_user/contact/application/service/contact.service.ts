import { Injectable, Inject } from '@nestjs/common';
import { Types } from 'mongoose';

import { ContactServiceInterface } from '../../domain/service/contact.service.interface';
import { ContactRepositoryInterface } from '../../domain/repository/contact.repository.interface';
import { Contact } from '../../domain/entity/contact.entity';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { ContactRequest } from 'src/contexts/module_user/user/application/adapter/dto/HTTP-REQUEST/user.request.CREATE';
import { UpdateContactRequest } from '../adapter/dto/HTTP-REQUEST/update.contact.request';

@Injectable()
export class ContactService implements ContactServiceInterface {
  constructor(
    @Inject('ContactRepositoryInterface')
    private readonly contactRepository: ContactRepositoryInterface,
    private logger: MyLoggerService,
  ) { }
  async updateContact(contactId: string, updateRequest: UpdateContactRequest): Promise<void> {
    try {
      this.logger.log('Updating contact in service: ' + ContactService.name);
      return await this.contactRepository.updateContact(contactId, updateRequest);
    } catch (error: any) {
      this.logger.error('An error was ocurred when updating contact: ' + contactId);
      throw error;
    }
  }

  async createContact(
    contact: ContactRequest,
    session: any,
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
      return await this.contactRepository.createContact(contactMapped, session);
    } catch (error) {
      throw error;
    }
  }
}
