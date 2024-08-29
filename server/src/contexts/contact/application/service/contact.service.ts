import { Injectable, Inject } from '@nestjs/common';
import { Types } from 'mongoose';

import { ContactServiceInterface } from '../../domain/service/contact.service.interface';
import { ContactRepositoryInterface } from '../../domain/repository/contact.repository.interface';
import { ContactRequestDto } from '../../infraestructure/controller/request/contact.request';
import { Contact } from '../../domain/entity/contact.entity';

@Injectable()
export class ContactService implements ContactServiceInterface {
  constructor(
    @Inject('ContactRepositoryInterface')
    private readonly contactRepository: ContactRepositoryInterface,
  ) {}
  async createContact(contact: ContactRequestDto): Promise<Types.ObjectId> {
    try {
      const formatContact: Contact = Contact.formatDtoToEntity(contact);
      return await this.contactRepository.createContact(formatContact);
    } catch (error) {
      throw error;
    }
  }
}
