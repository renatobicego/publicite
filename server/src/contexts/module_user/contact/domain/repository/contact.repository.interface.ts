import { ClientSession, Types } from 'mongoose';
import { Contact } from '../entity/contact.entity';

export interface ContactRepositoryInterface {
  createContact(
    contact: Contact,
    options?: { session?: ClientSession },
  ): Promise<Types.ObjectId>;
  updateContact(contactId: string, updateRequest: any): Promise<any>;
}
