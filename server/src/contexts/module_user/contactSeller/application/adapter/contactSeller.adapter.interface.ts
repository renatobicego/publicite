import { ContactSellerGetType } from '../../domain/model/contactSeller.model';

export interface ContactSellerAdapterInterface {
  createContactSeller(contactSeller: any): Promise<any>;
  getContactSellerById(
    contactSellerGetType: ContactSellerGetType,
    _id: string, limit: number, page: number
  ): Promise<any>;
  setToOpinionRequestInTrue(_id: any): Promise<any>;
}
