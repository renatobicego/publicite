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
import { MagazineSectionModel } from "src/contexts/module_magazine/magazine/infrastructure/schemas/section/magazine.section.schema";
import { NotificationGroup } from "src/contexts/module_user/notification/domain/entity/notification.group.entity";
import { NotificationGroupModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.group.schema";
import { NotificationGroupService } from "src/contexts/module_user/notification/application/service/notification.group.service";
import { NotificationRepository } from "src/contexts/module_user/notification/infrastructure/repository/notification.repository";
import { NotificationContactSellerModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.contactSeller.schema";
import { NotificationMagazineModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.magazine.schema";
import { NotificationPaymentModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.payment.schema";
import { NotificationPostModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.post.schema";
import { NotificationPostCalificationModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.postCalification.schema";
import NotificationModel from "src/contexts/module_user/notification/infrastructure/schemas/notification.schema";
import { NotificationShareModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.share.schema";
import { NotificationSubscriptionModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.subscription.schema";
import { NotificationUserModel } from "src/contexts/module_user/notification/infrastructure/schemas/notification.user.schema";



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
                { name: 'MagazineSection', schema: MagazineSectionModel.schema },
                { name: 'NotificationGroup', schema: NotificationGroupModel.schema },

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
                provide: 'NotificationRepositoryInterface',
                useClass: NotificationRepository
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

        ]


    }).compile();

}

const mapModuleTesting: Map<string, any> = new Map([
    ["group", group_testing_module],


]);

export default mapModuleTesting;
