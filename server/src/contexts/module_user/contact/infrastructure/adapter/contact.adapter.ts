import { Inject } from '@nestjs/common';
import { ContactAdapterInterface } from '../../application/adapter/contact.adapter.interface';
import { UpdateContactRequest } from '../../application/adapter/dto/HTTP-REQUEST/update.contact.request';
import { ContactServiceInterface } from '../../domain/service/contact.service.interface';

export class ContactAdapter implements ContactAdapterInterface {
  constructor(
    @Inject('ContactServiceInterface')
    private readonly contactService: ContactServiceInterface
  ) { }

  async updateContact(contactId: string, updateRequest: UpdateContactRequest): Promise<void> {
    try {
      return await this.contactService.updateContact(contactId, updateRequest);
    } catch (error: any) { throw error; }
  }

}
