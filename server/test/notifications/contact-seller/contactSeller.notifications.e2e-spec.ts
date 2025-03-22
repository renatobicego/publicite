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
import createNotificationPostCalification_testing from "../model/postCalification.notification.test.model";

import { NotificationService } from "src/contexts/module_user/notification/application/service/notification.service";
import createTestingNotification_e2e from "../../../test/functions_e2e_testing/createNotification";
import createTestingPost_e2e from "../../../test/functions_e2e_testing/create.post";
import { PostDocument } from "src/contexts/module_post/post/infraestructure/schemas/post.schema";



enum PostCalificationEnum {
    request = 'request',
    response = 'response',
}

enum PostType {
    good = 'good',
    service = 'service',
    petition = 'petition',
}


describe('Contact seller notifications & Post califications test', () => {
    let dbConnection: Connection;
    let httpServer: any;
    let app: any;
    let moduleRef: TestingModule
    let PUBLICITE_SOCKET_API_KEY: string;
    let notificationService: NotificationService;
    let userService: UserService;
    let notificationRepository: NotificationRepository;



    let userModel: Model<IUser>;
    let contactSellerModel: Model<ContactSellerDocument>
    let notificationModel: Model<NotificationDocument>
    let postModel: Model<PostDocument>

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
        postModel = moduleRef.get<Model<PostDocument>>(getModelToken('Post'))

        notificationService = moduleRef.get<NotificationService>('NotificationServiceInterface');
        userService = moduleRef.get<UserService>('UserServiceInterface');
        notificationRepository = moduleRef.get<NotificationRepository>('NotificationRepositoryInterface');
    })


    afterEach(async () => {
        await userModel.deleteMany({});
        await contactSellerModel.deleteMany({});
        await notificationModel.deleteMany({});
        await postModel.deleteMany({});
        jest.restoreAllMocks();
    })
    afterAll(async () => {
        await dbConnection.close();
        await app.close();
    })


    describe('Contact seller notifications', () => {
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
            expect(response.body.message).toContain("Cast to ObjectId failed");
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
            expect(response.body.message).toContain("Cast to ObjectId failed");
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


            jest.spyOn(userService, 'pushNotificationToUserArrayNotifications').mockRejectedValueOnce(new Error('Failed to push notification'));

            const response = await request(httpServer)
                .post('/socket/contact-seller')
                .set('Authorization', PUBLICITE_SOCKET_API_KEY)
                .send(notification_contactSeller);

            expect(response.status).toBe(500);
            expect(response.body.message).toContain("Failed to push notification");
        });
    })
    //'notification_new_calification_request',   // Te han solicitado una calificación de un bien o servicio
    //   'notification_new_calification_response'   // te han hecho una review de tu post

    describe('Post Calification notifications', () => {

        it('Request new post calification, Juan request to pedro', async () => {
            const juanId = new Types.ObjectId();
            const pedroId = new Types.ObjectId();
            const contactSellerId = new Types.ObjectId();
            await contactSellerModel.create({
                _id: contactSellerId,
                client: {
                    clientId: new Types.ObjectId().toString(),
                    name: "Juan",
                    email: "juan@example.com",
                    lastName: "Pérez",
                    username: "juanperez",
                    phone: "+1234567890",
                    message: "Estoy interesado en tu publicación."
                },
                post: new Types.ObjectId(),
                notification_id: new Types.ObjectId(),
                owner: pedroId,
                date: new Date(),
                isOpinionRequested: false,
                isOpinionRequestAvailable: true
            })

            await createTestingUser_e2e({
                _id: pedroId,
                notifications: [],
            }, dbConnection)


            const notification_requestCalification = createNotificationPostCalification_testing({
                event: "notification_new_calification_request",
                type: "post_calification_notifications",
                frontData: {
                    postCalification: {
                        postCalificationType: PostCalificationEnum.request,
                        contactSeller_id: contactSellerId.toString(),
                        review: null
                    }

                },
                backData: {
                    userIdTo: pedroId.toString(),
                    userIdFrom: juanId.toString()
                }
            });


            const response = await request(httpServer)
                .post('/socket/post-calification')
                .set('Authorization', PUBLICITE_SOCKET_API_KEY)
                .send(notification_requestCalification);

            expect(response.status).toBe(201);
            const contactSellerEntity = await contactSellerModel.findById(contactSellerId);
            expect(contactSellerEntity?.isOpinionRequested).toBe(true);

            const pedro = await userModel.findById(pedroId);
            expect(pedro?.notifications.length).toBe(1);







        })

        it('Should return an error when contactSellerId is null', async () => {
            const juanId = new Types.ObjectId();
            const pedroId = new Types.ObjectId();
            const contactSellerId = new Types.ObjectId();
            await contactSellerModel.create({
                _id: contactSellerId,
                client: {
                    clientId: new Types.ObjectId().toString(),
                    name: "Juan",
                    email: "juan@example.com",
                    lastName: "Pérez",
                    username: "juanperez",
                    phone: "+1234567890",
                    message: "Estoy interesado en tu publicación."
                },
                post: new Types.ObjectId(),
                notification_id: new Types.ObjectId(),
                owner: pedroId,
                date: new Date(),
                isOpinionRequested: false,
                isOpinionRequestAvailable: true
            })

            await createTestingUser_e2e({
                _id: pedroId,
                notifications: [],
            }, dbConnection)


            const notification_requestCalification = createNotificationPostCalification_testing({
                event: "notification_new_calification_request",
                type: "post_calification_notifications",
                frontData: {
                    postCalification: {
                        postCalificationType: PostCalificationEnum.request,
                        contactSeller_id: null,

                        review: null
                    }

                },
                backData: {
                    userIdFrom: juanId.toString(),
                    userIdTo: pedroId.toString(),
                },
                notificationEntityId: "asdasd"
            });


            const response = await request(httpServer)
                .post('/socket/post-calification')
                .set('Authorization', PUBLICITE_SOCKET_API_KEY)
                .send(notification_requestCalification);

            expect(response.status).toBe(500);
            expect(response.body.message.message).toContain("Error occurred, contactSeller_id is null");
            const contactSellerEntity = await contactSellerModel.findById(contactSellerId);
            expect(contactSellerEntity?.isOpinionRequested).toBe(false);

            const pedro = await userModel.findById(pedroId);
            expect(pedro?.notifications.length).toBe(0);







        })

        it('Should return 304 error if request has already been made', async () => {
            const juanId = new Types.ObjectId();
            const pedroId = new Types.ObjectId();
            jest.spyOn(notificationRepository, 'isThisNotificationDuplicate').mockReturnValue(Promise.resolve(true));
            const contactSellerId = new Types.ObjectId();
            await contactSellerModel.create({
                _id: contactSellerId,
                client: {
                    clientId: new Types.ObjectId().toString(),
                    name: "Juan",
                    email: "juan@example.com",
                    lastName: "Pérez",
                    username: "juanperez",
                    phone: "+1234567890",
                    message: "Estoy interesado en tu publicación."
                },
                post: new Types.ObjectId(),
                notification_id: new Types.ObjectId(),
                owner: pedroId,
                date: new Date(),
                isOpinionRequested: false,
                isOpinionRequestAvailable: true
            })

            await createTestingUser_e2e({
                _id: pedroId,
                notifications: [],
            }, dbConnection)

            const notification_requestCalification = createNotificationPostCalification_testing({
                event: "notification_new_calification_request",
                type: "post_calification_notifications",
                frontData: {
                    postCalification: {
                        postCalificationType: PostCalificationEnum.request,
                        contactSeller_id: contactSellerId.toString(),
                        review: null
                    }
                },
                backData: {
                    userIdTo: pedroId.toString(),
                    userIdFrom: juanId.toString()
                },
                notificationEntityId: "new Types.ObjectId().toString()"
            });

            const response = await request(httpServer)
                .post('/socket/post-calification')
                .set('Authorization', PUBLICITE_SOCKET_API_KEY)
                .send(notification_requestCalification);

            expect(response.status).toBe(304);
            const contactSellerEntity = await contactSellerModel.findById(contactSellerId);
            expect(contactSellerEntity?.isOpinionRequested).toBe(false);

            const pedro = await userModel.findById(pedroId);
            expect(pedro?.notifications.length).toBe(0);
        })






        it('Send new calification post to user, Pedro send rating to Juan', async () => {
            const juanId = new Types.ObjectId();
            const pedroId = new Types.ObjectId();
            const previous_notification_id = new Types.ObjectId();
            const postId = new Types.ObjectId();
            const contactSellerId = new Types.ObjectId();

            await contactSellerModel.create({
                _id: contactSellerId,
                client: {
                    clientId: new Types.ObjectId().toString(),
                    name: "Juan",
                    email: "juan@example.com",
                    lastName: "Pérez",
                    username: "juanperez",
                    phone: "+1234567890",
                    message: "Estoy interesado en tu publicación."
                },
                post: new Types.ObjectId(),
                notification_id: new Types.ObjectId(),
                owner: pedroId,
                date: new Date(),
                isOpinionRequested: false,
                isOpinionRequestAvailable: true
            })

            await createTestingNotification_e2e({
                _id: previous_notification_id,
                isActionsAvailable: true,
                event: "notification_new_calification_request",
            }, dbConnection);

            await createTestingPost_e2e({
                _id: postId,
                title: "post con comment",
                author: juanId.toString(),
                reviews: []
            }, dbConnection)

            const notification_requestCalification = createNotificationPostCalification_testing({
                event: "notification_new_calification_response",
                type: "post_calification_notifications",
                viewed: false,
                frontData: {
                    postCalification: {
                        postCalificationType: PostCalificationEnum.response,
                        contactSeller_id: contactSellerId.toString(),
                        post: {
                            _id: postId,
                            title: "post con comment",
                            author: juanId.toString(),
                            description: "description",
                            imagesUrls: ["imagesUrls"],
                            postType: PostType.good
                        },
                        review: {
                            author: new Types.ObjectId(),
                            review: "Muy bueno",
                            date: new Date(),
                            rating: 5
                        }
                    }
                },
                backData: {
                    userIdTo: pedroId.toString(),
                    userIdFrom: juanId.toString()
                },
                notificationEntityId: "asdasd",
                socketJobId: "asdasd",

                previousNotificationId: previous_notification_id.toString()
            });






            const response = await request(httpServer)
                .post('/socket/post-calification')
                .set('Authorization', PUBLICITE_SOCKET_API_KEY)
                .send(notification_requestCalification);

            expect(response.status).toBe(201);
            const post = await postModel.findById(postId);
            console.log(post)






        })






    })



})
