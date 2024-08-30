import { ContactAdapterInterface } from '../../application/adapter/contact.adapter.interface';

export class ContactAdapter implements ContactAdapterInterface {
  createContact(contact: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
