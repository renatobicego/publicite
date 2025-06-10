import { Types } from 'mongoose';
import { Contact } from '../entity/contact.entity';

export interface ContactRepositoryInterface {
  createContact(
    contact: Contact,
    session: any,
  ): Promise<Types.ObjectId>;
  updateContact(contactId: string, updateRequest: any): Promise<any>;
}
