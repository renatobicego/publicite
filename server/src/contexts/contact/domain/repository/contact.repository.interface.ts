import { Types } from 'mongoose';
import { Contact } from '../entity/contact.entity';

export interface ContactRepositoryInterface {
  createContact(contact: Contact): Promise<Types.ObjectId>;
}
