
export interface ContactSellerRepositoryInterface {
    save(contactSeller: any): Promise<any>;
    getContactSellerById(condition: {}): Promise<any>
    setOpinionRequestInTrue(_id: any): Promise<any>
}