import { ContactSeller } from '../contactSeller.entity';
import { ContactSellerGetType } from '../graphql/contactSeller.model';

export interface ContactSellerServiceInterface {
  createContactSeller(contactSeller: ContactSeller): Promise<boolean>;
  getContactSellerById(
    contactSellerGetType: ContactSellerGetType,
    _id: string, limit:number,page:number

  ): Promise<any>;
  setOpinionRequestInTrue(_id: any): Promise<any>;
}
