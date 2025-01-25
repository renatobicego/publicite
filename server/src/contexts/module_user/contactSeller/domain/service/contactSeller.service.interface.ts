import { ContactSeller } from "../contactSeller.entity";

export interface ContactSellerServiceInterface {
    createContactSeller(contactSeller: ContactSeller): Promise<Boolean>;
}