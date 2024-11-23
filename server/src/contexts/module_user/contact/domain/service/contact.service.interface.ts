import { ClientSession, Types } from 'mongoose';
import { ContactRequest } from 'src/contexts/module_user/user/application/adapter/dto/HTTP-REQUEST/user.request.CREATE';
import { UpdateContactRequest } from '../../application/adapter/dto/HTTP-REQUEST/update.contact.request';

export interface ContactServiceInterface {
  createContact(
    contact: ContactRequest,
    options?: { session?: ClientSession },
  ): Promise<Types.ObjectId>;
  updateContact(contactId: string, updateRequest: UpdateContactRequest): Promise<void>;

}

