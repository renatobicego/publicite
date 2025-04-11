import { Test, TestingModule } from "@nestjs/testing";
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import * as dotenv from 'dotenv';
import { EventEmitter2, EventEmitterModule } from "@nestjs/event-emitter";

import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { GroupSchema } from "../group/infrastructure/schemas/group.schema";
import { GroupService } from "../group/application/service/group.service";
import { GroupServiceMapper } from "../group/application/service/mapper/group.service.mapper";
import { GroupRepository } from "../group/infrastructure/repository/group.repository";
import { GroupRepositoryMapper } from "../group/infrastructure/repository/mapper/group.repository.mapper";
import { NotificationModule } from "src/contexts/module_user/notification/infrastructure/module/notification.module";
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EmmiterModule } from "src/contexts/module_shared/event-emmiter/emiter.module";
import { PostModule } from "src/contexts/module_post/post/infraestructure/module/post.module";
import { LoggerModule } from "src/contexts/module_shared/logger/logger.module";
import { MagazineModelSharedModule } from "src/contexts/module_shared/sharedSchemas/magazine.model.schema";
import { UserModule } from "src/contexts/module_user/user/infrastructure/module/user.module";
import { MagazineSectionModel } from "src/contexts/module_magazine/magazine/infrastructure/schemas/section/magazine.section.schema";
import { NotificationGroupModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.group.schema";
import { NotificationContactSellerModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.contactSeller.schema";
import { NotificationMagazineModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.magazine.schema";
import { NotificationPaymentModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.payment.schema";
import { NotificationPostModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.post.schema";
import { NotificationPostCalificationModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.postCalification.schema";
import NotificationModel from "src/contexts/module_user/notification/infrastructure/schemas/notification.schema";
import { NotificationShareModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.share.schema";
import { NotificationSubscriptionModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.subscription.schema";
import { NotificationUserModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.user.schema";
import { Connection } from "mongoose";



const group_testing_module = async (): Promise<TestingModule> => {
    dotenv.config({ path: '.env.test' });


    return Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({ 
                envFilePath: '.env.test',
                isGlobal: true, 
            }),
            PostModule,
            UserModule,
            EventEmitterModule.forRoot(
            ),
            EmmiterModule,
            MagazineModelSharedModule,
            MongooseModule.forRootAsync({
                useFactory: async (configService: ConfigService) => ({
                    uri: configService.get<string>('DATABASE_URI_TEST'),
                }),
                inject: [ConfigService], 
            }),
            MongooseModule.forFeature([
                { name: 'Group', schema: GroupSchema },
                { name: UserModel.modelName, schema: UserModel.schema },
                { name: 'MagazineSection', schema: MagazineSectionModel.schema },
            ]),
            LoggerModule,
            NotificationModule
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
                provide: getModelToken(NotificationMagazineModel.modelName),
                useValue: {}, // Mock vacío
            },
            {
                provide: getModelToken(NotificationModel.modelName),
                useValue: {}, // Mock vacío
            },

            {
                provide: getModelToken(NotificationUserModel.modelName),
                useValue: {}, // Mock vacío
            },

            {
                provide: getModelToken(NotificationPostModel.modelName),
                useValue: {}, // Mock vacío
            },

            {
                provide: getModelToken(NotificationContactSellerModel.modelName),
                useValue: {}, // Mock vacío
            },
            {
                provide: getModelToken(NotificationGroupModel.modelName),
                useValue: {}, // Mock vacío
            },

            {
                provide: getModelToken(NotificationPaymentModel.modelName),
                useValue: {}, // Mock vacío
            },

            {
                provide: getModelToken(NotificationPostCalificationModel.modelName),
                useValue: {}, // Mock vacío
            },

            {
                provide: getModelToken(NotificationShareModel.modelName),
                useValue: {}, // Mock vacío
            },
            {
                provide: getModelToken(NotificationSubscriptionModel.modelName),
                useValue: {}, // Mock vacío
            },
            {
                provide: EventEmitter2,
                useValue: {}
            },
            {
                provide: Connection,
                useClass: Connection
            }



        ]


    }).compile();

}

const mapModuleTesting: Map<string, any> = new Map([
    ["group", group_testing_module],


]);

export default mapModuleTesting;
