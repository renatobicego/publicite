import { ContactSellerGetType } from "../../domain/graphql/contactSeller.model"

export interface ContactSellerAdapterInterface {
    createContactSeller(contactSeller: any): Promise<any>
    getContactSellerById(contactSellerGetType: ContactSellerGetType, _id: string): Promise<any>
}