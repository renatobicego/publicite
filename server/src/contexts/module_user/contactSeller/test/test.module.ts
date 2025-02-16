import { Test, TestingModule } from "@nestjs/testing";
import * as dotenv from 'dotenv';
import { MongooseModule } from "@nestjs/mongoose";


import { ContactSellerModule } from "../infrastructure/module/contactSeller.module";
import { ContactSellerModel } from "../infrastructure/schema/contactSeller.schema";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { ContactSellerService } from "../application/service/contactSeller.service";
import { ContactSellerAdapter } from "../infrastructure/contactSeller.adapter";
import { ContactSellerRepository } from "../infrastructure/repository/contactSeller.repository";


const contactSellerModuleTesting = async (): Promise<TestingModule> => {
    dotenv.config({ path: '.env.test' });
    const uri = process.env.DATABASE_URI;

    return Test.createTestingModule({
        imports: [
            ContactSellerModule,
            MongooseModule.forRootAsync({
                useFactory: async () => {
                    return {
                        uri: uri,
                    };
                },
            }),
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
        ]

    }).compile();
};

const mapContactSellerModuleTesting = new Map<string, any>([
    ["contactSeller", contactSellerModuleTesting],
])

export default mapContactSellerModuleTesting 