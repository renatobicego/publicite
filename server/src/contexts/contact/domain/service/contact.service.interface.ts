import { ClientSession, Types } from 'mongoose';
import { ContactRequestDto } from '../../infraestructure/controller/request/contact.request';

export interface ContactServiceInterface {
  createContact(
    contact: ContactRequestDto,
    options?: { session?: ClientSession },
  ): Promise<Types.ObjectId>;
}
