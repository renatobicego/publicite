import { ContactSeller } from "../contactSeller.entity";
import { ContactSellerGetType } from "../graphql/contactSeller.model";

export interface ContactSellerServiceInterface {
    createContactSeller(contactSeller: ContactSeller): Promise<Boolean>;
    getContactSellerById(contactSellerGetType: ContactSellerGetType, _id: string): Promise<any>
}