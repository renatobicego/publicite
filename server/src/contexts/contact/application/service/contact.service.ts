import { Injectable, Inject } from '@nestjs/common';
import { ClientSession, Types } from 'mongoose';

import { ContactServiceInterface } from '../../domain/service/contact.service.interface';
import { ContactRepositoryInterface } from '../../domain/repository/contact.repository.interface';
import { ContactRequestDto } from '../../infraestructure/controller/request/contact.request';
import { Contact } from '../../domain/entity/contact.entity';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';

@Injectable()
export class ContactService implements ContactServiceInterface {
  constructor(
    @Inject('ContactRepositoryInterface')
    private readonly contactRepository: ContactRepositoryInterface,
    private logger: MyLoggerService,
  ) {}

  async createContact(
    contact: ContactRequestDto,
    options?: { session?: ClientSession },
  ): Promise<Types.ObjectId> {
    try {
      this.logger.log('Creating contact in service: ' + ContactService.name);
      const formatContact: Contact = Contact.formatDtoToEntity(contact);
      return await this.contactRepository.createContact(formatContact, options);
    } catch (error) {
      throw error;
    }
  }
}
