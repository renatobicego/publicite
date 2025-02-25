import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import * as dotenv from 'dotenv';
import { Test, TestingModule } from "@nestjs/testing";


import { MagazineModel } from "src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.schema";
import { EmitterService } from "src/contexts/module_shared/event-emmiter/emmiter";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { ContactModule } from "../../contact/infrastructure/module/contact.module";
import { UserService } from "../application/service/user.service";
import { UserRepository } from "../infrastructure/repository/user.repository";
import { UserRelationModel } from "../infrastructure/schemas/user.relation.schema";
import { UserModel } from "../infrastructure/schemas/user.schema";
import { UserBusinessModel } from "../infrastructure/schemas/userBussiness.schema";
import { UserPersonModel } from "../infrastructure/schemas/userPerson.schema";
import { SubscriptionSchema } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscription.schema";
import { SubscriptionPlanSchema } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscriptionPlan.schema";
import PostModel from "src/contexts/module_post/post/infraestructure/schemas/post.schema";
import { MagazineSectionModel } from "src/contexts/module_magazine/magazine/infrastructure/schemas/section/magazine.section.schema";
import { GroupModel } from "src/contexts/module_group/group/infrastructure/schemas/group.schema";
import NotificationModel from "../../notification/infrastructure/schemas/notification.schema";
import PostReviewModel from "src/contexts/module_post/PostReview/infrastructure/schemas/review.schema";
import { MagazineModelSharedModule } from "src/contexts/module_shared/sharedSchemas/magazine.model.schema";

const clerk_update_module = async (): Promise<TestingModule> => {
    dotenv.config({ path: '.env.test' });
    const uri = process.env.DATABASE_URI;

    return Test.createTestingModule({
        imports: [
            ContactModule,
            MongooseModule.forRootAsync({
                useFactory: async () => {
                    return {
                        uri: uri,
                    };
                },
            }),
            MongooseModule.forFeature([
                { name: UserModel.modelName, schema: UserModel.schema },

            ]),
        ],
        providers: [
            MyLoggerService,
            { provide: 'UserServiceInterface', useClass: UserService },
            { provide: 'UserRepositoryInterface', useClass: UserRepository },
            { provide: EmitterService, useValue: {} },
            { provide: 'SectorRepositoryInterface', useValue: {} },
            { provide: getModelToken(UserPersonModel.modelName), useValue: {} },
            { provide: getModelToken(UserBusinessModel.modelName), useValue: {} },
            { provide: getModelToken(MagazineModel.modelName), useValue: {} },
        ],
    }).compile();
};

const make_relation_module = async (): Promise<TestingModule> => {
    dotenv.config({ path: '.env.test' });
    const uri = process.env.DATABASE_URI;

    return Test.createTestingModule({
        imports: [
            ContactModule,
            MongooseModule.forRootAsync({

                useFactory: async () => {
                    return {
                        uri: uri,
                    };
                },
            }),
            MongooseModule.forFeature([
                { name: UserModel.modelName, schema: UserModel.schema },
                { name: UserRelationModel.modelName, schema: UserRelationModel.schema },
                { name: 'Subscription', schema: SubscriptionSchema },
                { name: 'SubscriptionPlan', schema: SubscriptionPlanSchema },
                { name: PostModel.modelName, schema: PostModel.schema, },
                { name: PostReviewModel.modelName, schema: PostReviewModel.schema, },
                { name: MagazineModel.modelName, schema: MagazineModel.schema },
                { name: MagazineSectionModel.modelName, schema: MagazineSectionModel.schema },
                { name: GroupModel.modelName, schema: GroupModel.schema },
                { name: NotificationModel.modelName, schema: GroupModel.schema },

            ]),
            MagazineModelSharedModule
        ],
        providers: [
            MyLoggerService,
            { provide: 'UserServiceInterface', useClass: UserService },
            { provide: 'UserRepositoryInterface', useClass: UserRepository },
            { provide: EmitterService, useValue: {} },
            { provide: 'SectorRepositoryInterface', useValue: {} },
            { provide: getModelToken(UserPersonModel.modelName), useValue: {} },
            { provide: getModelToken(UserBusinessModel.modelName), useValue: {} },
        ],
    }).compile();
};


const mapModuleTesting: Map<string, any> = new Map([
    ["clerk-update", clerk_update_module],
    ["make-relation", make_relation_module],

]);

export default mapModuleTesting;