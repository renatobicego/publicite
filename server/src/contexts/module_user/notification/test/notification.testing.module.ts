import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import * as dotenv from 'dotenv';
import { Test, TestingModule } from "@nestjs/testing";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { NotificationService } from "../application/service/notification.service";
import { NotificationAdapter } from "../infrastructure/adapter/notification.adapter";

import { NotificationSubscriptionService } from "../application/service/notification.subscription.service";
import { UserService } from "../../user/application/service/user.service";
import { NotificationRepository } from "../infrastructure/repository/notification.repository";
import NotificationModel from "../infrastructure/schemas/notification.schema";
import { NotificationSubscriptionModel } from "../infrastructure/schemas/notification.subscription.schema";
import { UserRepository } from "../../user/infrastructure/repository/user.repository";
import { NotificationContactSellerModel } from "../infrastructure/schemas/notification.contactSeller.schema";
import { NotificationMagazineModel } from "../infrastructure/schemas/notification.magazine.schema";
import { NotificationPaymentModel } from "../infrastructure/schemas/notification.payment.schema";
import { NotificationPostModel } from "../infrastructure/schemas/notification.post.schema";
import { NotificationPostCalificationModel } from "../infrastructure/schemas/notification.postCalification.schema";
import { NotificationShareModel } from "../infrastructure/schemas/notification.share.schema";
import { NotificationUserModel } from "../infrastructure/schemas/notification.user.schema";
import { NotificationGroupModel } from "../infrastructure/schemas/notification.group.schema";
import { EmitterService } from "src/contexts/module_shared/event-emmiter/emmiter";
import { UserPersonModel } from "../../user/infrastructure/schemas/userPerson.schema";
import { UserRelationModel } from "../../user/infrastructure/schemas/user.relation.schema";
import { UserModel } from "../../user/infrastructure/schemas/user.schema";
import { UserBusinessModel } from "../../user/infrastructure/schemas/userBussiness.schema";
import { UserMagazineModel } from "src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.user.schema";
import { ConfigModule, ConfigService } from "@nestjs/config";



const downgradePlan_module = async (): Promise<TestingModule> => {
    dotenv.config({ path: '.env.test' });


    return Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({
                envFilePath: '.env.test',
                isGlobal: true,
            }),
            MongooseModule.forRootAsync({
                useFactory: async (configService: ConfigService) => ({
                    uri: configService.get<string>('DATABASE_URI_TEST'),
                }),
                inject: [ConfigService],
            }),
            MongooseModule.forFeature([
                {
                    name: NotificationModel.modelName,
                    schema: NotificationModel.schema,
                    discriminators: [
                        // { name: NotificationGroupModel.modelName, schema: NotificationGroupModel.schema },
                        // { name: NotificationMagazineModel.modelName, schema: NotificationMagazineModel.schema },
                        // { name: NotificationUserModel.modelName, schema: NotificationUserModel.schema },
                        // { name: NotificationPostModel.modelName, schema: NotificationPostModel.schema },
                        // { name: NotificationContactSellerModel.modelName, schema: NotificationContactSellerModel.schema },
                        // { name: NotificationPaymentModel.modelName, schema: NotificationPaymentModel.schema },
                        // { name: NotificationPostCalificationModel.modelName, schema: NotificationPostCalificationModel.schema },
                        // { name: NotificationShareModel.modelName, schema: NotificationShareModel.schema },
                        { name: NotificationSubscriptionModel.modelName, schema: NotificationSubscriptionModel.schema },
                    ],
                    
                },
                { name: UserModel.modelName, schema: UserModel.schema },
                { name: UserMagazineModel.modelName, schema: UserMagazineModel.schema },
            ]),
        ],
        providers: [
            MyLoggerService,
            { provide: 'NotificationServiceInterface', useClass: NotificationService },
            { provide: 'NotificationAdapterInterface', useClass: NotificationAdapter },
            { provide: 'NotificationSubscriptionServiceInterface', useClass: NotificationSubscriptionService },
            { provide: 'UserServiceInterface', useClass: UserService },
            { provide: 'NotificationRepositoryInterface', useClass: NotificationRepository },
            { provide: 'UserRepositoryInterface', useClass: UserRepository },
            { provide: 'NotificationMagazineServiceInterface', useValue: {} },
            { provide: 'NotificationGroupServiceInterface', useValue: {} },
            { provide: 'NotificationUserServiceInterface', useValue: {} },
            { provide: 'NotificationPostServiceInterface', useValue: {} },
            { provide: 'NotificationContactSellerServiceInterface', useValue: {} },
            { provide: 'NotificationRequestCalificationServiceInterface', useValue: {} },
            { provide: 'NotificationShareServiceInterface', useValue: {} },
            { provide: 'ContactServiceInterface', useValue: {} },
            { provide: 'SectorRepositoryInterface', useValue: {} },


            { provide: EmitterService, useValue: {} },
            { provide: getModelToken(NotificationMagazineModel.modelName), useValue: {} },
            { provide: getModelToken(NotificationGroupModel.modelName), useValue: {} },
            { provide: getModelToken(NotificationUserModel.modelName), useValue: {} },
            { provide: getModelToken(NotificationPostModel.modelName), useValue: {} },
            { provide: getModelToken(NotificationContactSellerModel.modelName), useValue: {} },
            { provide: getModelToken(NotificationPaymentModel.modelName), useValue: {} },
            { provide: getModelToken(NotificationPostCalificationModel.modelName), useValue: {} },
            { provide: getModelToken(NotificationShareModel.modelName), useValue: {} },
            { provide: getModelToken(UserPersonModel.modelName), useValue: {} },
            { provide: getModelToken(UserBusinessModel.modelName), useValue: {} },

            { provide: getModelToken(UserRelationModel.modelName), useValue: {} },







        ],
    }).compile();
};


const mapModuleTesting: Map<string, any> = new Map([
    ["downgradePlan_module", downgradePlan_module],

]);

export default mapModuleTesting;