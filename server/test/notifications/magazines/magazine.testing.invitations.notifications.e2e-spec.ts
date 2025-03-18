import { Test } from "@nestjs/testing";
import { connection, Connection, Model, Types } from "mongoose";
import * as request from 'supertest';
import * as dotenv from 'dotenv';
import { getModelToken } from "@nestjs/mongoose";

import { AppModule } from "src/app.module";
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { DatabaseService } from "src/contexts/module_shared/database/infrastructure/database.service";
import { createNotificationMagazine_testing } from "../model/magazine.notification.test.model";
import createTestingUser_e2e from "../../../test/functions_e2e_testing/create.user";
import { MagazineDocument, MagazineModel } from "src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.schema";
import { createUserMagazine_e2e } from "../../../test/functions_e2e_testing/createMagazine";
import NotificationModel, { NotificationDocument } from "src/contexts/module_user/notification/infrastructure/schemas/notification.schema";



// 'notification_magazine_user_has_been_removed'// Te han eliminado de la revista


describe('Notification - Magazine invitations test', () => {
    let dbConnection: Connection;
    let httpServer: any;
    let app: any;
    let PUBLICITE_SOCKET_API_KEY: string;

    let userModel: Model<IUser>;
    let magazineModel: Model<MagazineDocument>
    let notificationModel: Model<NotificationDocument>

    beforeAll(async () => {
        dotenv.config({ path: '.env.test' });
        PUBLICITE_SOCKET_API_KEY = process.env.PUBLICITE_SOCKET_API_KEY!;

        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();

        dbConnection = moduleRef
            .get<DatabaseService>(DatabaseService)
            .getDBHandle();
        httpServer = app.getHttpServer();

        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        magazineModel = moduleRef.get<Model<MagazineDocument>>(getModelToken(MagazineModel.modelName))
        notificationModel = moduleRef.get<Model<NotificationDocument>>(getModelToken(NotificationModel.modelName))
    })

    afterEach(async () => {
        await userModel.deleteMany({});
        await magazineModel.deleteMany({});
        await notificationModel.deleteMany({});

    })


    afterAll(async () => {
        await dbConnection.close();
        await app.close();
    })


    it('Invite user to magazine (Juan invite Pedro to magazine)', async () => {
        const juan_id = new Types.ObjectId();
        const pedro_id = new Types.ObjectId();
        const magazine_notification = createNotificationMagazine_testing({
            frontData: {
                magazine: {
                    _id: new Types.ObjectId().toString(),
                    name: "magazine",
                }
            },
            event: "notification_magazine_new_user_invited",
            backData: {
                userIdTo: pedro_id.toString(),
                userIdFrom: juan_id.toString()
            }
        })

        await createTestingUser_e2e({
            _id: pedro_id,
            username: "pedritao",
            notifications: [],
        }, dbConnection)

        const response = await request(httpServer)
            .post('/socket/magazine')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(magazine_notification)

        expect(response.status).toBe(201);

        const pedro = await userModel.findById(pedro_id)
        expect(pedro?.notifications.length).toBe(1);

    })


    it('Acept invitation Magazine (Pedro acept the invitation from juan)', async () => {
        const juan_id = new Types.ObjectId();
        const pedro_id = new Types.ObjectId();
        const magazine_invite_notification_ID = new Types.ObjectId()
        const magazineID = new Types.ObjectId()

        await createUserMagazine_e2e({
            _id: magazineID,
            user: juan_id,
            collaborators: [],
        }, dbConnection)

        const magazine_invite_notification = createNotificationMagazine_testing({
            _id: magazine_invite_notification_ID,
            frontData: {
                magazine: {
                    _id: magazineID.toString(),
                    name: "magazine",
                    ownerType: "user",
                }
            },
            isActionsAvailable: true,
            event: "notification_magazine_new_user_invited",
            backData: {
                userIdTo: pedro_id.toString(),
                userIdFrom: juan_id.toString()
            }
        })

        await dbConnection.collection('Notifications').insertOne(magazine_invite_notification);


        const magazine_notification_accept = createNotificationMagazine_testing({
            frontData: {
                magazine: {
                    _id: magazineID.toString(),
                    name: "magazine",
                    ownerType: "user",
                }
            },
            event: "notification_magazine_acepted",
            backData: {
                userIdTo: juan_id.toString(),
                userIdFrom: pedro_id.toString()
            },
            previousNotificationId: magazine_invite_notification_ID.toString()
        })

        await createTestingUser_e2e({
            _id: pedro_id,
            username: "pedritao",
            email: "email@pedro",
            notifications: [],
            magazines: [],
        }, dbConnection)


        await createTestingUser_e2e({
            _id: juan_id,
            username: "juanito",
            email: "email@juan",
            notifications: [],
        }, dbConnection)

        const response = await request(httpServer)
            .post('/socket/magazine')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(magazine_notification_accept)

        expect(response.status).toBe(201);


        const previouNotification = await notificationModel.findById(magazine_invite_notification_ID)
        expect(previouNotification?.isActionsAvailable).toBe(false);


        const pedro = await userModel.findById(pedro_id)
        expect(pedro?.magazines.length).toBe(1);


        const juan = await userModel.findById(juan_id)
        expect(juan?.notifications.length).toBe(1);

        const magazine: any = await magazineModel.findById(magazineID)
        expect(magazine?.collaborators.length).toBe(1);
        expect(magazine?.collaborators[0].toString()).toEqual(pedro_id.toString());

    })


    it('Acept invitation Magazine without previous notification, should return 400 error', async () => {
        const juan_id = new Types.ObjectId();
        const pedro_id = new Types.ObjectId();
        const magazine_invite_notification_ID = new Types.ObjectId()
        const magazineID = new Types.ObjectId()

        await createUserMagazine_e2e({
            _id: magazineID,
            user: juan_id,
            collaborators: [],
        }, dbConnection)

        const magazine_invite_notification = createNotificationMagazine_testing({
            _id: magazine_invite_notification_ID,
            frontData: {
                magazine: {
                    _id: magazineID.toString(),
                    name: "magazine",
                    ownerType: "user",
                }
            },
            isActionsAvailable: true,
            event: "notification_magazine_new_user_invited",
            backData: {
                userIdTo: pedro_id.toString(),
                userIdFrom: juan_id.toString()
            }
        })

        await dbConnection.collection('Notifications').insertOne(magazine_invite_notification);


        const magazine_notification_accept = createNotificationMagazine_testing({
            frontData: {
                magazine: {
                    _id: magazineID.toString(),
                    name: "magazine",
                    ownerType: "user",
                }
            },
            event: "notification_magazine_acepted",
            backData: {
                userIdTo: juan_id.toString(),
                userIdFrom: pedro_id.toString()
            },
            previousNotificationId: null
        })

        await createTestingUser_e2e({
            _id: pedro_id,
            username: "pedritao",
            email: "email@pedro",
            notifications: [],
            magazines: [],
        }, dbConnection)


        await createTestingUser_e2e({
            _id: juan_id,
            username: "juanito",
            email: "email@juan",
            notifications: [],
        }, dbConnection)

        const response = await request(httpServer)
            .post('/socket/magazine')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(magazine_notification_accept)

        expect(response.status).toBe(400);


        const previouNotification = await notificationModel.findById(magazine_invite_notification_ID)
        expect(previouNotification?.isActionsAvailable).toBe(true);


        const pedro = await userModel.findById(pedro_id)
        expect(pedro?.magazines.length).toBe(0);


        const juan = await userModel.findById(juan_id)
        expect(juan?.notifications.length).toBe(0);

        const magazine: any = await magazineModel.findById(magazineID)
        expect(magazine?.collaborators.length).toBe(0);


    })


    it('Acept invitation Magazine with user not authorized, should return 401 error', async () => {
        const juan_id = new Types.ObjectId();
        const pedro_id = new Types.ObjectId();
        const magazine_invite_notification_ID = new Types.ObjectId()
        const magazineID = new Types.ObjectId()
        const userNotAuthorized = new Types.ObjectId().toString()

        await createUserMagazine_e2e({
            _id: magazineID,
            user: juan_id,
            collaborators: [],
        }, dbConnection)

        const magazine_invite_notification = createNotificationMagazine_testing({
            _id: magazine_invite_notification_ID,
            frontData: {
                magazine: {
                    _id: magazineID.toString(),
                    name: "magazine",
                    ownerType: "user",
                }
            },
            isActionsAvailable: true,
            event: "notification_magazine_new_user_invited",
            backData: {
                userIdTo: userNotAuthorized,
                userIdFrom: juan_id.toString()
            }
        })

        await dbConnection.collection('Notifications').insertOne(magazine_invite_notification);


        const magazine_notification_accept = createNotificationMagazine_testing({
            frontData: {
                magazine: {
                    _id: magazineID.toString(),
                    name: "magazine",
                    ownerType: "user",
                }
            },
            event: "notification_magazine_acepted",
            backData: {
                userIdTo: userNotAuthorized,
                userIdFrom: pedro_id.toString()
            },
            previousNotificationId: magazine_invite_notification_ID.toString()
        })

        await createTestingUser_e2e({
            _id: pedro_id,
            username: "pedritao",
            email: "email@pedro",
            notifications: [],
            magazines: [],
        }, dbConnection)


        await createTestingUser_e2e({
            _id: juan_id,
            username: "juanito",
            email: "email@juan",
            notifications: [],
        }, dbConnection)

        const response = await request(httpServer)
            .post('/socket/magazine')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(magazine_notification_accept)

        expect(response.status).toBe(401);


        const previouNotification = await notificationModel.findById(magazine_invite_notification_ID)
        expect(previouNotification?.isActionsAvailable).toBe(true);


        const pedro = await userModel.findById(pedro_id)
        expect(pedro?.magazines.length).toBe(0);


        const juan = await userModel.findById(juan_id)
        expect(juan?.notifications.length).toBe(0);

        const magazine: any = await magazineModel.findById(magazineID)
        expect(magazine?.collaborators.length).toBe(0);


    })

    it('Reject invitation Magazine (Pedro reject the invitation from juan)', async () => {
        const juan_id = new Types.ObjectId();
        const pedro_id = new Types.ObjectId();
        const magazine_invite_notification_ID = new Types.ObjectId()
        const magazineID = new Types.ObjectId()

        await createUserMagazine_e2e({
            _id: magazineID,
            user: juan_id,
            collaborators: [],
        }, dbConnection)

        const magazine_invite_notification = createNotificationMagazine_testing({
            _id: magazine_invite_notification_ID,
            frontData: {
                magazine: {
                    _id: magazineID.toString(),
                    name: "magazine",
                    ownerType: "user",
                }
            },
            isActionsAvailable: true,
            event: "notification_magazine_new_user_invited",
            backData: {
                userIdTo: pedro_id.toString(),
                userIdFrom: juan_id.toString()
            }
        })

        await dbConnection.collection('Notifications').insertOne(magazine_invite_notification);


        const magazine_notification_rejected = createNotificationMagazine_testing({
            frontData: {
                magazine: {
                    _id: magazineID.toString(),
                    name: "magazine",
                    ownerType: "user",
                }
            },
            event: "notification_magazine_rejected",
            backData: {
                userIdTo: juan_id.toString(),
                userIdFrom: pedro_id.toString()
            },
            previousNotificationId: magazine_invite_notification_ID.toString()
        })

        await createTestingUser_e2e({
            _id: pedro_id,
            username: "pedritao",
            email: "email@pedro",
            notifications: [],
            magazines: [],
        }, dbConnection)


        await createTestingUser_e2e({
            _id: juan_id,
            username: "juanito",
            email: "email@juan",
            notifications: [],
        }, dbConnection)

        const response = await request(httpServer)
            .post('/socket/magazine')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(magazine_notification_rejected)

        expect(response.status).toBe(201);


        const previouNotification = await notificationModel.findById(magazine_invite_notification_ID)
        expect(previouNotification?.isActionsAvailable).toBe(false);


        const pedro = await userModel.findById(pedro_id)
        expect(pedro?.magazines.length).toBe(0);


        const juan = await userModel.findById(juan_id)
        expect(juan?.notifications.length).toBe(1);

        const magazine: any = await magazineModel.findById(magazineID)
        expect(magazine?.collaborators.length).toBe(0);


    })

    it('Reject invitation Magazine without previous notification,should return 400 error', async () => {
        const juan_id = new Types.ObjectId();
        const pedro_id = new Types.ObjectId();
        const magazine_invite_notification_ID = new Types.ObjectId()
        const magazineID = new Types.ObjectId()

        await createUserMagazine_e2e({
            _id: magazineID,
            user: juan_id,
            collaborators: [],
        }, dbConnection)

        const magazine_invite_notification = createNotificationMagazine_testing({
            _id: magazine_invite_notification_ID,
            frontData: {
                magazine: {
                    _id: magazineID.toString(),
                    name: "magazine",
                    ownerType: "user",
                }
            },
            isActionsAvailable: true,
            event: "notification_magazine_new_user_invited",
            backData: {
                userIdTo: pedro_id.toString(),
                userIdFrom: juan_id.toString()
            }
        })

        await dbConnection.collection('Notifications').insertOne(magazine_invite_notification);


        const magazine_notification_rejected = createNotificationMagazine_testing({
            frontData: {
                magazine: {
                    _id: magazineID.toString(),
                    name: "magazine",
                    ownerType: "user",
                }
            },
            event: "notification_magazine_rejected",
            backData: {
                userIdTo: juan_id.toString(),
                userIdFrom: pedro_id.toString()
            },
            previousNotificationId: null
        })

        await createTestingUser_e2e({
            _id: pedro_id,
            username: "pedritao",
            email: "email@pedro",
            notifications: [],
            magazines: [],
        }, dbConnection)


        await createTestingUser_e2e({
            _id: juan_id,
            username: "juanito",
            email: "email@juan",
            notifications: [],
        }, dbConnection)

        const response = await request(httpServer)
            .post('/socket/magazine')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(magazine_notification_rejected)

        expect(response.status).toBe(400);


        const previouNotification = await notificationModel.findById(magazine_invite_notification_ID)
        expect(previouNotification?.isActionsAvailable).toBe(true);


        const pedro = await userModel.findById(pedro_id)
        expect(pedro?.magazines.length).toBe(0);


        const juan = await userModel.findById(juan_id)
        expect(juan?.notifications.length).toBe(0);

        const magazine: any = await magazineModel.findById(magazineID)
        expect(magazine?.collaborators.length).toBe(0);


    })

})