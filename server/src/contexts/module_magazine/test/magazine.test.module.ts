import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import * as dotenv from 'dotenv';
import { Test, TestingModule } from "@nestjs/testing";
import { MagazineAdapter } from "../magazine/infrastructure/resolver/adapter/magazine.adapter";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { MagazineService } from "../magazine/application/service/magazine.service";
import { MagazineRepository } from "../magazine/infrastructure/repository/magazine.repository";
import { GroupSchema } from "src/contexts/module_group/group/infrastructure/schemas/group.schema";
import { UserSchema } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { MagazineSchema } from "../magazine/infrastructure/schemas/magazine.schema";
import { MagazineSectionModel } from "../magazine/infrastructure/schemas/section/magazine.section.schema";
import { MagazineModelSharedModule } from "src/contexts/module_shared/sharedSchemas/magazine.model.schema";
import { PostSchema } from "src/contexts/module_post/post/infraestructure/schemas/post.schema";


const magazine_module_test = async (): Promise<TestingModule> => {
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
            MagazineModelSharedModule,
            MongooseModule.forFeature([
                { name: 'MagazineSection', schema: MagazineSectionModel.schema },
                { name: 'Magazine', schema: MagazineSchema },
                { name: 'User', schema: UserSchema },
                { name: 'Group', schema: GroupSchema },
                { name: 'Post', schema: PostSchema },

            ]),
        ],
        providers: [
            MyLoggerService,
            {
                provide: 'MagazineAdapterInterface',
                useClass: MagazineAdapter,
            },
            {
                provide: 'MagazineServiceInterface',
                useClass: MagazineService,
            },
            {
                provide: 'MagazineRepositoryInterface',
                useClass: MagazineRepository,
            },
            {
                provide: 'UserMagazineAllowedVerificationsInterface',
                useClass: MagazineRepository,
            },
            {
                provide: 'MagazineRepositoryMapperInterface',
                useValue: {},
            },
            // { provide: 'SectorRepositoryInterface', useValue: {} },
            // { provide: getModelToken(UserPersonModel.modelName), useValue: {} },

        ],
    }).compile();
};


const mapModuleTesting: Map<string, any> = new Map([
    ["magazine", magazine_module_test],


]);

export default mapModuleTesting;