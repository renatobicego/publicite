import mongoose, { Model, Connection, Types } from "mongoose";
import { TestingModule } from "@nestjs/testing";
import { getModelToken } from '@nestjs/mongoose';


import mapModuleTesting from "./user.test.module";
import { UserService } from "../application/service/user.service";
import { IUser, UserModel } from '../infrastructure/schemas/user.schema';
import { UserRelationDocument, UserRelationModel } from "../infrastructure/schemas/user.relation.schema";
import SubscriptionModel, { SubscriptionDocument } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscription.schema";
import SubscriptionPlanModel, { SubscriptionPlanDocument } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscriptionPlan.schema";

import { createPersonalUser } from "../../../../../test/functions_unit_testing/user/create.user";
import { createPlanOfSubscription, createSubscriptionForUser } from "../../../../../test/functions_unit_testing/plans/create.planAndSub";



describe('UserService - Get limit of contacts and posts by user', () => {
    let connection: Connection;
    let userService: UserService;
    let userRelationModel: Model<UserRelationDocument>
    let userModel: Model<IUser>;
    let subscriptionModel: Model<SubscriptionDocument>
    let subscriptionPlanModel: Model<SubscriptionPlanDocument>



    beforeAll(async () => {
        const moduleRef: TestingModule = await mapModuleTesting.get("make-relation")();
        userService = moduleRef.get<UserService>('UserServiceInterface');
        connection = mongoose.connection;
        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        userRelationModel = moduleRef.get<Model<UserRelationDocument>>(getModelToken(UserRelationModel.modelName));
        subscriptionModel = moduleRef.get<Model<SubscriptionDocument>>(getModelToken(SubscriptionModel.modelName));
        subscriptionPlanModel = moduleRef.get<Model<SubscriptionPlanDocument>>(getModelToken(SubscriptionPlanModel.modelName));
    });

    afterAll(async () => {
        await connection.close();

    });

    afterEach(async () => {
        await userModel.deleteMany({});
        await subscriptionModel.deleteMany({});
        await subscriptionPlanModel.deleteMany({});
    });

    it('Get limit of contacts and posts by user with some plan', async () => {
        const totalAgendaPostLimit_EXPECTED = 10;
        const totalLibrePostLimit_EXPECTED = 10;
        const contactLimit_EXPECTED = 10;
        const plan_id = new Types.ObjectId("66c49508e80296e90ec637d8");
        const subscription_plan_id = new Types.ObjectId("66c49508e80296e90ec637d9");
        const user_id = new Types.ObjectId("66c49508e80296e90ec637d7");
        const subscription = new Map([["subscriptions", subscription_plan_id]])
        await createPersonalUser(userModel, { _id: user_id, subscriptions: subscription });
        await createPlanOfSubscription(plan_id, subscriptionPlanModel, totalAgendaPostLimit_EXPECTED, totalLibrePostLimit_EXPECTED, contactLimit_EXPECTED);
        await createSubscriptionForUser(subscription_plan_id, user_id.toString(), plan_id, subscriptionModel, "");



        const {
            agendaPostCount,
            librePostCount,
            totalAgendaPostLimit,
            totalLibrePostLimit,
            agendaAvailable,
            libreAvailable,
            contactLimit,
            contactCount,
            contactAvailable
        } = await userService.getPostAndLimitsFromUserByUserId(user_id.toString());


        expect(agendaPostCount).toBe(0);
        expect(librePostCount).toBe(0);
        expect(totalAgendaPostLimit).toBe(totalAgendaPostLimit_EXPECTED);
        expect(totalLibrePostLimit).toBe(totalLibrePostLimit_EXPECTED);
        expect(agendaAvailable).toBe(totalAgendaPostLimit_EXPECTED);
        expect(libreAvailable).toBe(totalLibrePostLimit_EXPECTED);
        expect(contactLimit).toBe(contactLimit_EXPECTED);
        expect(contactCount).toBe(0);
        expect(contactAvailable).toBe(contactLimit_EXPECTED);


    })



});



