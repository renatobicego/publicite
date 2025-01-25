import { Inject, Injectable } from "@nestjs/common";
import { ContactSellerServiceInterface } from "../../domain/service/contactSeller.service.interface";
import { ContactSeller } from "../../domain/contactSeller.entity";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { ContactSellerRepositoryInterface } from "../../domain/repository/contactSeller.repository.interface";


export class ContactSellerService implements ContactSellerServiceInterface {



    constructor(
        private readonly logger: MyLoggerService,
        @Inject('ContactSellerRepositoryInterface')
        private readonly contactSellerRepository: ContactSellerRepositoryInterface
    ) {

    }

    async createContactSeller(contactSeller: ContactSeller): Promise<Boolean> {
        try {
            this.logger.log('Creating contactSeller in adapter: ' + ContactSellerService.name);
            return await this.contactSellerRepository.save(contactSeller);
        } catch (error: any) {
            throw error
        }
    }

} 