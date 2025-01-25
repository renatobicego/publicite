import { Module } from "@nestjs/common";
import { ContactSellerAdapter } from "../contactSeller.adapter";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ContactSellerModel } from "../schema/contactSeller.schema";
import { ContactSellerService } from "../../application/service/contactSeller.service";
import { ContactSellerRepository } from "../repository/contactSeller.repository";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: ContactSellerModel.modelName,
                schema: ContactSellerModel.schema,
            },
        ]),
    ],
    providers: [
        MyLoggerService,
        {
            provide: "ContactSellerServiceInterface",
            useClass: ContactSellerService,
        },
        {
            provide: "ContactSellerAdapterInterface",
            useClass: ContactSellerAdapter,
        },
        {
            provide: "ContactSellerRepositoryInterface",
            useClass: ContactSellerRepository,
        },
    ],
})
export class ContactSellerModule { }
