import mongoose, { Model, Connection, Types } from "mongoose";
import { TestingModule } from "@nestjs/testing";
import { getModelToken } from '@nestjs/mongoose';

import { NotificationAdapter } from "../infrastructure/adapter/notification.adapter";
import { IUser, UserModel } from "../../user/infrastructure/schemas/user.schema";
import { createPersonalUser } from "../../../../../test/functions_unit_testing/user/create.user";
import { typeOfNotification } from "../domain/allowed-events/allowed.events.notifications";
import mapModuleTesting from "./notification.testing.module";






describe('UserService - Get limit of contacts and posts by user', () => {
    let connection: Connection;
    let notificationAdapter: NotificationAdapter;
    let userModel: Model<IUser>;
    let user_id: Types.ObjectId
    let subscription_plan_id: Types.ObjectId
    const DOWNGRADE_PLAN_CONTACT_EVENT = 'notification_downgrade_plan_contact';
    const DOWNGRADE_PLAN_POST_EVENT = 'notification_downgrade_plan_post';





    beforeAll(async () => {
        const moduleRef: TestingModule = await mapModuleTesting.get("downgradePlan_module")();
        connection = mongoose.connection;

        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));

        notificationAdapter = moduleRef.get<NotificationAdapter>('NotificationAdapterInterface');
        subscription_plan_id = new Types.ObjectId("66c49508e80296e90ec637d9");
        user_id = new Types.ObjectId("66c49508e80296e90ec637d7");
        await createPersonalUser(userModel, { _id: user_id, subscriptions: [subscription_plan_id], userType: "person" });
    });

    afterAll(async () => {
        await connection.close();
        await userModel.deleteMany({});

    });

    afterEach(async () => {

    });



    it('Create a downgrade plan contact notification', async () => {

        const notificationExpected = {

            event: DOWNGRADE_PLAN_CONTACT_EVENT,
            viewed: false,
            user: user_id.toString(),
            backData: {
                userIdTo: user_id.toString(),
                userIdFrom: "Publicite Subscription information"
            },
            socketJobId: "This notification does not have a socketJobId",
            type: typeOfNotification.subscription_notifications,
            notificationEntityId: typeOfNotification.subscription_notifications,
            frontData: {
                subscription: {
                    event: DOWNGRADE_PLAN_CONTACT_EVENT
                }
            }

        }
        await notificationAdapter.downgrade_plan_contact(user_id.toString());
        const user: any = await userModel.findById(user_id).populate('notifications')

        expect(user?.notifications[0].event).toBe(notificationExpected.event);
        expect(user?.notifications[0].viewed).toBe(notificationExpected.viewed);
        expect(user?.notifications[0].user).toBe(notificationExpected.user);
        expect(user?.notifications[0].backData.userIdTo).toBe(notificationExpected.backData.userIdTo);
        expect(user?.notifications[0].backData.userIdFrom).toBe(notificationExpected.backData.userIdFrom);
        expect(user?.notifications[0].socketJobId).toBe(notificationExpected.socketJobId);
        expect(user?.notifications[0].type).toBe(notificationExpected.type);
        expect(user?.notifications[0].notificationEntityId).toBe(notificationExpected.notificationEntityId);
        expect(user?.notifications[0].frontData.subscription.event).toBe(notificationExpected.frontData.subscription.event);







    });




});



