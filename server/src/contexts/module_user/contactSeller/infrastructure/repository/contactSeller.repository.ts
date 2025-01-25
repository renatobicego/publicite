import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";



import { ContactSellerDocument, ContactSellerModel } from "../schema/contactSeller.schema";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { ContactSellerRepositoryInterface } from "../../domain/repository/contactSeller.repository.interface";

export class ContactSellerRepository implements ContactSellerRepositoryInterface {
    constructor(
        private readonly logger: MyLoggerService,
        @InjectModel(ContactSellerModel.modelName)
        private readonly contactSellerModel: Model<ContactSellerDocument>,
    ) { }
    async save(contactSeller: any): Promise<Boolean> {
        try {
            const newContactSeller = new this.contactSellerModel(contactSeller);
            const result = await newContactSeller.save();
            console.log(result)
            if (result) {
                this.logger.log('Saving contactSeller in repository success');
                return true
            } else {
                this.logger.log('ERROR saving contactSeller in repository ');
                return false
            }
        } catch (error: any) {
            throw error
        }
    }




}