import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import * as dotenv from 'dotenv';
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";

const post_testing_module = async (): Promise<TestingModule> => {
    dotenv.config({ path: '.env.test' });
    const uri = process.env.DATABASE_URI;

    return Test.createTestingModule({
        imports: [
            MongooseModule.forRootAsync({

                useFactory: async () => {
                    return {
                        uri: uri,
                    };
                },
            }),
            MongooseModule.forFeature([


            ]),

        ],
        providers: [
            MyLoggerService,
            // { provide: 'SectorRepositoryInterface', useValue: {} },

            // { provide: getModelToken(UserBusinessModel.modelName), useValue: {} },
        ],
    }).compile();
};


const mapModuleTesting: Map<string, any> = new Map([
    ["post", post_testing_module],
]);

export default mapModuleTesting;