import { Types } from 'mongoose';
import { ContactRequestDto } from '../../infraestructure/controller/request/contact.request';

export interface ContactServiceInterface {
  createContact(contact: ContactRequestDto): Promise<Types.ObjectId>;
}
