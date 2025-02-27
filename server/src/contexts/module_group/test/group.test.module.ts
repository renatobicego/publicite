import { Test, TestingModule } from "@nestjs/testing";
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import * as dotenv from 'dotenv';

import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { UserModel, UserSchema } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { GroupSchema } from "../group/infrastructure/schemas/group.schema";
import { GroupService } from "../group/application/service/group.service";
import { GroupServiceMapper } from "../group/application/service/mapper/group.service.mapper";
import { GroupRepository } from "../group/infrastructure/repository/group.repository";
import { GroupRepositoryMapper } from "../group/infrastructure/repository/mapper/group.repository.mapper";
import { NotificationModule } from "src/contexts/module_user/notification/infrastructure/module/notification.module";
import { forwardRef, Logger } from "@nestjs/common";
import { EventEmitter2, EventEmitterModule } from "@nestjs/event-emitter";

import { EmmiterModule } from "src/contexts/module_shared/event-emmiter/emiter.module";
import { PostModule } from "src/contexts/module_post/post/infraestructure/module/post.module";
import { LoggerModule } from "src/contexts/module_shared/logger/logger.module";
import { MagazineModelSharedModule } from "src/contexts/module_shared/sharedSchemas/magazine.model.schema";
import { UserModule } from "src/contexts/module_user/user/infrastructure/module/user.module";



const group_testing_module = async (): Promise<TestingModule> => {
    dotenv.config({ path: '.env.test' });
    const uri = process.env.DATABASE_URI

    return Test.createTestingModule({
        imports: [
            PostModule,
            UserModule,
            EventEmitterModule.forRoot(
            ),
            EmmiterModule,
            MagazineModelSharedModule,
            MongooseModule.forRootAsync({
                useFactory: async () => {
                    return {
                        uri: uri,
                    };
                },
            }),
            MongooseModule.forFeature([
                { name: 'Group', schema: GroupSchema },
                { name: UserModel.modelName, schema: UserModel.schema },

            ]),
            LoggerModule,
        ],
        providers: [
            MyLoggerService,
            {
                provide: 'GroupRepositoryInterface',
                useClass: GroupRepository,
            },
            {
                provide: 'GroupServiceInterface',
                useClass: GroupService,
            },

            {
                provide: 'GroupRepositoryMapperInterface',
                useClass: GroupRepositoryMapper,
            },
            {
                provide: 'GroupServiceMapperInterface',
                useClass: GroupServiceMapper,
            },
            {
                provide: EventEmitter2,
                useValue: {}
            },



        ]


    }).compile();

}

const mapModuleTesting: Map<string, any> = new Map([
    ["group", group_testing_module],


]);

export default mapModuleTesting;
