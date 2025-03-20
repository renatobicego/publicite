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
import { UserService } from "src/contexts/module_user/user/application/service/user.service";
import { NotificationRepository } from "src/contexts/module_user/notification/infrastructure/repository/notification.repository";

describe('Contact seller notifications test', () => {
    let dbConnection: Connection;
    let httpServer: any;
    let app: any;
    let moduleRef: TestingModule
    let PUBLICITE_SOCKET_API_KEY: string;

    let userModel: Model<IUser>;
    let contactSellerModel: Model<ContactSellerDocument>
    let notificationModel: Model<NotificationDocument>
    let userService: UserService;
    let notificationRepository: NotificationRepository;

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

        userService = moduleRef.get<UserService>('UserServiceInterface');
        notificationRepository = moduleRef.get<NotificationRepository>('NotificationRepositoryInterface');
    })


    afterEach(async () => {

        await contactSellerModel.deleteMany({});
        await notificationModel.deleteMany({});
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
    it('should throw an error when userIdTo is null or does not exist', async () => {
        const pedroId = new Types.ObjectId();
        const postID = new Types.ObjectId();
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
                userIdTo: null as any, // userIdTo es nulo
                userIdFrom: pedroId.toString(),
            }
        });

        const response = await request(httpServer)
            .post('/socket/contact-seller')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification_contactSeller);

        expect(response.status).toBe(500);
        expect(response.body.message).toEqual("Notificacion no valida"); // Mensaje real
    });

    it('should throw an error when userIdFrom is null or does not exist', async () => {
        const juanId = new Types.ObjectId();
        const postID = new Types.ObjectId();
        const notification_contactSeller = createNotificationContactSeller_testing({
            event: "notification_new_contact",
            frontData: {
                contactSeller: {
                    post: postID.toString(),
                    client: {
                        clientId: null as any, // userIdFrom es nulo
                        name: "Juan",
                        email: "lK2Bt@example.com",
                    }
                }
            },
            backData: {
                userIdTo: juanId.toString(),
                userIdFrom: null as any, // userIdFrom es nulo
            }
        });

        const response = await request(httpServer)
            .post('/socket/contact-seller')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification_contactSeller);

        expect(response.status).toBe(500);
        expect(response.body.message).toContain("Cast to ObjectId failed"); // Mensaje real
    });

    it('should throw an error when post or client is null', async () => {
        const juanId = new Types.ObjectId();
        const pedroId = new Types.ObjectId();
        const notification_contactSeller = createNotificationContactSeller_testing({
            event: "notification_new_contact",
            frontData: {
                contactSeller: {
                    post: null, // post es nulo
                    client: null as any, // client es nulo
                }
            },
            backData: {
                userIdTo: juanId.toString(),
                userIdFrom: pedroId.toString(),
            }
        });

        const response = await request(httpServer)
            .post('/socket/contact-seller')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification_contactSeller);

        expect(response.status).toBe(500);
        expect(response.body.message).toContain("Cast to ObjectId failed"); // Mensaje real
    });

    it('should throw an error when notification cannot be saved', async () => {
        const juanId = new Types.ObjectId();
        const pedroId = new Types.ObjectId();
        const postID = new Types.ObjectId();
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
        });
    
        // Mockear el método saveNotificationContactSeller para que devuelva null
        jest.spyOn(notificationRepository, 'saveNotificationContactSeller').mockResolvedValueOnce(null);
    
        const response = await request(httpServer)
            .post('/socket/contact-seller')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification_contactSeller);
    
        expect(response.status).toBe(500);
        expect(response.body.message.message).toBe("Error was ocurred, notificationId is null - saveNotificationContactSeller"); // Usar .toBe en lugar de .toContain
    });

    it('should throw an error when notification cannot be pushed to user', async () => {
        const juanId = new Types.ObjectId();
        const pedroId = new Types.ObjectId();
        const postID = new Types.ObjectId();
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
        });

        // Mockear el método pushNotificationToUserArrayNotifications para que lance un error
        jest.spyOn(userService, 'pushNotificationToUserArrayNotifications').mockRejectedValueOnce(new Error('Failed to push notification'));

        const response = await request(httpServer)
            .post('/socket/contact-seller')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification_contactSeller);

        expect(response.status).toBe(500);
        expect(response.body.message).toContain("Failed to push notification"); // Mensaje real
    });


})
