import { Test, TestingModule } from "@nestjs/testing";
import * as dotenv from 'dotenv';
import { MongooseModule } from "@nestjs/mongoose";


import { ContactSellerModule } from "../infrastructure/module/contactSeller.module";
import { ContactSellerModel } from "../infrastructure/schema/contactSeller.schema";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { ContactSellerService } from "../application/service/contactSeller.service";
import { ContactSellerAdapter } from "../infrastructure/contactSeller.adapter";
import { ContactSellerRepository } from "../infrastructure/repository/contactSeller.repository";
import { ConfigModule, ConfigService } from "@nestjs/config";


const contactSellerModuleTesting = async (): Promise<TestingModule> => {
    dotenv.config({ path: '.env.qa' });


    return Test.createTestingModule({
        imports: [
            ContactSellerModule,
            ConfigModule.forRoot({
                envFilePath: '.env.test',
                isGlobal: true,
            }),
            MongooseModule.forRootAsync({
                useFactory: async (configService: ConfigService) => ({
                    uri: configService.get<string>('DATABASE_URI'),
                }),
                inject: [ConfigService],
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