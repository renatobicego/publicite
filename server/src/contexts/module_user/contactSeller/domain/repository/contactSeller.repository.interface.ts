
export interface ContactSellerRepositoryInterface {
    save(contactSeller: any): Promise<any>;
    getContactSellerById(condition: {}, limit: number, page: number): Promise<any>
    setOpinionRequestInTrue(_id: any): Promise<any>
}