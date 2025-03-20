import { Connection, Model, Types } from "mongoose";
import * as request from 'supertest';
import { getModelToken } from "@nestjs/mongoose";

import startServerForE2ETest from "../../../test/getStartede2e-test";
import { createNotificationContactSeller_testing } from "../model/contactSeller.notification.model";
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { TestingModule } from "@nestjs/testing";
import { ContactSellerDocument, ContactSellerModel } from "src/contexts/module_user/contactSeller/infrastructure/schema/contactSeller.schema";
import NotificationModel, { NotificationDocument } from "src/contexts/module_user/notification/infrastructure/schemas/notification.schema";
import createTestingUser_e2e from "../../../test/functions_e2e_testing/create.user";

describe('Contact seller notifications test', () => {
    let dbConnection: Connection;
    let httpServer: any;
    let app: any;
    let moduleRef: TestingModule
    let PUBLICITE_SOCKET_API_KEY: string;

    let userModel: Model<IUser>;
    let contactSellerModel: Model<ContactSellerDocument>
    let notificationModel: Model<NotificationDocument>


    beforeAll(async () => {
        const {
            databaseConnection,
            application,
            server,
            module,
            SOCKET_SECRET } = await startServerForE2ETest();
        moduleRef = module
        dbConnection = databaseConnection
        app = application
        httpServer = server
        PUBLICITE_SOCKET_API_KEY = SOCKET_SECRET

        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        contactSellerModel = moduleRef.get<Model<ContactSellerDocument>>(getModelToken(ContactSellerModel.modelName))
        notificationModel = moduleRef.get<Model<NotificationDocument>>(getModelToken(NotificationModel.modelName))

    })



    afterAll(async () => {
        await userModel.deleteMany({});
        await contactSellerModel.deleteMany({});
        await notificationModel.deleteMany({});
        await dbConnection.close();
        await app.close();
    })


    it('New conact seller request, Pedro contacts Juan', async () => {
        const juanId = new Types.ObjectId();
        const pedroId = new Types.ObjectId();
        const postID = new Types.ObjectId();
        await createTestingUser_e2e({
            _id: juanId,
            notifications: [],
        }, dbConnection)
        const notification_contactSeller = createNotificationContactSeller_testing({
            event: "notification_new_contact",
            frontData: {
                contactSeller: {
                    post: postID.toString(),
                    client: {
                        clientId: pedroId.toString(),
                        name: "Juan",
                        email: "lK2Bt@example.com",
                    }
                }
            },
            backData: {
                userIdTo: juanId.toString(),
                userIdFrom: pedroId.toString(),
            }
        })




        const response = await request(httpServer)
            .post('/socket/contact-seller')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification_contactSeller)

        expect(response.status).toBe(201);

        const juan = await userModel.findById(juanId)
        expect(juan?.notifications.length).toBe(1);

        const contactSeller: any = await contactSellerModel.findOne({ post: postID })
        console.log(contactSeller)
        expect(contactSeller).not.toBe(null);
        expect(contactSeller.post.toString()).toEqual(postID.toString());
        expect(contactSeller.isOpinionRequested).toBe(false);
        expect(contactSeller.isOpinionRequestAvailable).toBe(true);
        expect(contactSeller.owner.toString()).toEqual(juanId.toString());

    })
})
