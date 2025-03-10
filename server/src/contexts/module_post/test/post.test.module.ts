import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import * as dotenv from 'dotenv';
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { PostGoodModel } from "../post/infraestructure/schemas/post-types-schemas/post.good.schema";
import { PostPetitionModel } from "../post/infraestructure/schemas/post-types-schemas/post.petition.schema";
import { PostServiceModel } from "../post/infraestructure/schemas/post-types-schemas/post.service.schema";
import PostModel from "../post/infraestructure/schemas/post.schema";
import { PostService } from "../post/application/service/post.service";
import { PostRepository } from "../post/infraestructure/repository/post.repository";

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
                {
                    name: PostModel.modelName,
                    schema: PostModel.schema,
                    discriminators: [
                        { name: PostGoodModel.modelName, schema: PostGoodModel.schema },
                        { name: PostServiceModel.modelName, schema: PostServiceModel.schema },
                        {
                            name: PostPetitionModel.modelName,
                            schema: PostPetitionModel.schema,
                        },
                    ],
                },

            ]),

        ],
        providers: [
            MyLoggerService,
            {
                provide: 'PostRepositoryInterface',
                useClass: PostRepository,
            },
            {
                provide: 'PostServiceInterface',
                useClass: PostService,
            },
            // { provide: 'SectorRepositoryInterface', useValue: {} },

            // { provide: getModelToken(UserBusinessModel.modelName), useValue: {} },
        ],
    }).compile();
};


const mapModuleTesting: Map<string, any> = new Map([
    ["post", post_testing_module],
]);

export default mapModuleTesting;