
export interface ContactSellerRepositoryInterface {
    save(contactSeller: any): Promise<any>;
    getContactSellerById(condition: {}): Promise<any>
}