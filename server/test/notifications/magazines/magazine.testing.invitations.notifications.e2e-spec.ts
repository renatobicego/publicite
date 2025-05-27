import { Connection, Model, Types } from "mongoose";
import * as request from 'supertest';
import { getModelToken } from "@nestjs/mongoose";


import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { createNotificationMagazine_testing } from "../model/magazine.notification.test.model";
import createTestingUser_e2e from "../../../test/functions_e2e_testing/create.user";
import { MagazineDocument, MagazineModel } from "src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.schema";
import { createGroupMagazine_e2e, createUserMagazine_e2e } from "../../../test/functions_e2e_testing/createMagazine";
import NotificationModel, { NotificationDocument } from "src/contexts/module_user/notification/infrastructure/schemas/notification.schema";
import createTestingGroup_e2e from "../../../test/functions_e2e_testing/create.group";
import { GroupDocument, GroupModel } from "src/contexts/module_group/group/infrastructure/schemas/group.schema";
import startServerForE2ETest from "../../../test/getStartede2e-test";





describe('Notification - Magazine invitations test', () => {
    let dbConnection: Connection;
    let httpServer: any;
    let app: any;
    let PUBLICITE_SOCKET_API_KEY: string;

    let userModel: Model<IUser>;
    let magazineModel: Model<MagazineDocument>
    let notificationModel: Model<NotificationDocument>
    let groupModel: Model<GroupDocument>

    beforeAll(async () => {
        const {
            module,
            databaseConnection,
            SOCKET_SECRET,
            application,
            server } = await startServerForE2ETest();
            
        PUBLICITE_SOCKET_API_KEY = SOCKET_SECRET
        dbConnection = databaseConnection
        const moduleRef = module
        app = application
        httpServer = server


        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        magazineModel = moduleRef.get<Model<MagazineDocument>>(getModelToken(MagazineModel.modelName))
        notificationModel = moduleRef.get<Model<NotificationDocument>>(getModelToken(NotificationModel.modelName))
        groupModel = moduleRef.get<Model<GroupDocument>>(getModelToken(GroupModel.modelName))
    })

    afterEach(async () => {
        await userModel.deleteMany({});
        await magazineModel.deleteMany({});
        await notificationModel.deleteMany({});
        await groupModel.deleteMany({});
    })


    afterAll(async () => {
        await dbConnection.close();
        await app.close();
    })


    describe('User Magazine Test', () => {

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

        it('Invite user to magazine (Juan invite Pedro to magazine), invitation already sent, should return 304', async () => {
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

            await request(httpServer)
                .post('/socket/magazine')
                .set('Authorization', PUBLICITE_SOCKET_API_KEY)
                .send(magazine_notification)

            const response = await request(httpServer)
                .post('/socket/magazine')
                .set('Authorization', PUBLICITE_SOCKET_API_KEY)
                .send(magazine_notification)

            expect(response.status).toBe(304);

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


        it('Remove user from magazine (Juan remove Pedro from magazine) ', async () => {
            const juan_id = new Types.ObjectId();
            const pedro_id = new Types.ObjectId();
            const magazineID = new Types.ObjectId()


            await createUserMagazine_e2e({
                _id: magazineID,
                user: juan_id,
                collaborators: [pedro_id],
            }, dbConnection)


            await createTestingUser_e2e({
                _id: pedro_id,
                username: "pedritao",
                email: "email@pedro",
                notifications: [],
                magazines: [magazineID],
            }, dbConnection)

            const magazine_notification_user_removed = createNotificationMagazine_testing({
                frontData: {
                    magazine: {
                        _id: magazineID.toString(),
                        name: "magazine",
                        ownerType: "user",
                    }
                },
                event: "notification_magazine_user_has_been_removed",
                backData: {
                    userIdTo: pedro_id.toString(),
                    userIdFrom: juan_id.toString()
                },
                previousNotificationId: null
            })



            const response = await request(httpServer)
                .post('/socket/magazine')
                .set('Authorization', PUBLICITE_SOCKET_API_KEY)
                .send(magazine_notification_user_removed)


            expect(response.status).toBe(201);

            const pedro = await userModel.findById(pedro_id)
            expect(pedro?.magazines.length).toBe(0);
            expect(pedro?.notifications.length).toBe(1);


            const magazine: any = await magazineModel.findById(magazineID)
            expect(magazine?.collaborators.length).toBe(0);









        })

        it('Remove user from magazine with user not authorized, should return 401 error ', async () => {
            const juan_id = new Types.ObjectId();
            const pedro_id = new Types.ObjectId();
            const magazineID = new Types.ObjectId()
            const unauthorizedUser = new Types.ObjectId().toString()


            await createUserMagazine_e2e({
                _id: magazineID,
                user: juan_id,
                collaborators: [pedro_id],
            }, dbConnection)


            await createTestingUser_e2e({
                _id: pedro_id,
                username: "pedritao",
                email: "email@pedro",
                notifications: [],
                magazines: [magazineID],
            }, dbConnection)

            const magazine_notification_user_removed = createNotificationMagazine_testing({
                frontData: {
                    magazine: {
                        _id: magazineID.toString(),
                        name: "magazine",
                        ownerType: "user",
                    }
                },
                event: "notification_magazine_user_has_been_removed",
                backData: {
                    userIdTo: pedro_id.toString(),
                    userIdFrom: unauthorizedUser
                },
                previousNotificationId: null
            })



            const response = await request(httpServer)
                .post('/socket/magazine')
                .set('Authorization', PUBLICITE_SOCKET_API_KEY)
                .send(magazine_notification_user_removed)


            expect(response.status).toBe(401);

            const pedro = await userModel.findById(pedro_id)
            expect(pedro?.magazines.length).toBe(1);
            expect(pedro?.notifications.length).toBe(0);


            const magazine: any = await magazineModel.findById(magazineID)
            expect(magazine?.collaborators.length).toBe(1);









        })
    })

    describe('Group Magazine Test', () => {

        it('Invite user to group magazine (Juan invite Pedro to magazine)', async () => {
            const juan_id = new Types.ObjectId();
            const pedro_id = new Types.ObjectId();
            const magazine_notification = createNotificationMagazine_testing({
                frontData: {
                    magazine: {
                        _id: new Types.ObjectId().toString(),
                        name: "magazine",
                        ownerType: "group",
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

        it('Invite user to group magazine (Juan invite Pedro to magazine), invitation already sent, should return 304', async () => {
            const juan_id = new Types.ObjectId();
            const pedro_id = new Types.ObjectId();
            const magazine_notification = createNotificationMagazine_testing({
                frontData: {
                    magazine: {
                        _id: new Types.ObjectId().toString(),
                        name: "magazine",
                        ownerType: "group",
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

            await request(httpServer)
                .post('/socket/magazine')
                .set('Authorization', PUBLICITE_SOCKET_API_KEY)
                .send(magazine_notification)

            const response = await request(httpServer)
                .post('/socket/magazine')
                .set('Authorization', PUBLICITE_SOCKET_API_KEY)
                .send(magazine_notification)

            expect(response.status).toBe(304);

            const pedro = await userModel.findById(pedro_id)
            expect(pedro?.notifications.length).toBe(1);

        })


        it('Acept invitation Group Magazine (Pedro acept the invitation from juan)', async () => {
            const juan_id = new Types.ObjectId();
            const pedro_id = new Types.ObjectId();
            const group_id = new Types.ObjectId();
            const magazine_invite_notification_ID = new Types.ObjectId()
            const magazineID = new Types.ObjectId()

            await createTestingGroup_e2e({
                _id: group_id,
                name: "group",
                creator: juan_id,
                magazines: [magazineID]
            }, dbConnection)


            await createGroupMagazine_e2e({
                _id: magazineID,
                group: group_id,
                allowedCollaborators: [],
            }, dbConnection)



            const magazine_invite_notification = createNotificationMagazine_testing({
                _id: magazine_invite_notification_ID,
                frontData: {
                    magazine: {
                        _id: magazineID.toString(),
                        name: "magazine",
                        ownerType: "group",
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
                        ownerType: "group",
                        groupInviting: {
                            _id: group_id.toString(),
                            name: "group"
                        }
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
            expect(pedro?.magazines.length).toBe(0); // group magazine doesn't add to user magazine array

            const juan = await userModel.findById(juan_id)
            expect(juan?.notifications.length).toBe(1);

            const magazine: any = await magazineModel.findById(magazineID)
            expect(magazine?.allowedCollaborators.length).toBe(1);
            expect(magazine?.allowedCollaborators[0].toString()).toEqual(pedro_id.toString());

        })

        it('Acept invitation Group Magazine with invalid user ', async () => {
            const juan_id = new Types.ObjectId();
            const pedro_id = new Types.ObjectId();
            const group_id = new Types.ObjectId();
            const magazine_invite_notification_ID = new Types.ObjectId()
            const magazineID = new Types.ObjectId()
            const invalidUser = new Types.ObjectId().toString()

            await createTestingGroup_e2e({
                _id: group_id,
                name: "group",
                creator: juan_id,
                magazines: [magazineID]
            }, dbConnection)


            await createGroupMagazine_e2e({
                _id: magazineID,
                group: group_id,
                allowedCollaborators: [],
            }, dbConnection)



            const magazine_invite_notification = createNotificationMagazine_testing({
                _id: magazine_invite_notification_ID,
                frontData: {
                    magazine: {
                        _id: magazineID.toString(),
                        name: "magazine",
                        ownerType: "group",
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
                        ownerType: "group",
                        groupInviting: {
                            _id: group_id.toString(),
                            name: "group"
                        }
                    }
                },
                event: "notification_magazine_acepted",
                backData: {
                    userIdTo: invalidUser,
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




            const juan = await userModel.findById(juan_id)
            expect(juan?.notifications.length).toBe(0);

            const magazine: any = await magazineModel.findById(magazineID)
            expect(magazine?.allowedCollaborators.length).toBe(0);


        })

        it('Acept invitation Group Magazine without previou notification, should return 400', async () => {
            const juan_id = new Types.ObjectId();
            const pedro_id = new Types.ObjectId();
            const group_id = new Types.ObjectId();
            const magazine_invite_notification_ID = new Types.ObjectId()
            const magazineID = new Types.ObjectId()

            await createTestingGroup_e2e({
                _id: group_id,
                name: "group",
                creator: juan_id,
                magazines: [magazineID]
            }, dbConnection)


            await createGroupMagazine_e2e({
                _id: magazineID,
                group: group_id,
                allowedCollaborators: [],
            }, dbConnection)



            const magazine_invite_notification = createNotificationMagazine_testing({
                _id: magazine_invite_notification_ID,
                frontData: {
                    magazine: {
                        _id: magazineID.toString(),
                        name: "magazine",
                        ownerType: "group",
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
                        ownerType: "group",
                        groupInviting: {
                            _id: group_id.toString(),
                            name: "group"
                        }
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
            expect(pedro?.magazines.length).toBe(0); // group magazine doesn't add to user magazine array

            const juan = await userModel.findById(juan_id)
            expect(juan?.notifications.length).toBe(0);

            const magazine: any = await magazineModel.findById(magazineID)
            expect(magazine?.allowedCollaborators.length).toBe(0);


        })


        it('Reject invitation Group Magazine (Pedro reject the invitation from juan)', async () => {
            const juan_id = new Types.ObjectId();
            const pedro_id = new Types.ObjectId();
            const group_id = new Types.ObjectId();
            const magazine_invite_notification_ID = new Types.ObjectId()
            const magazineID = new Types.ObjectId()

            await createTestingGroup_e2e({
                _id: group_id,
                name: "group",
                creator: juan_id,
                magazines: [magazineID]
            }, dbConnection)


            await createGroupMagazine_e2e({
                _id: magazineID,
                group: group_id,
                allowedCollaborators: [],
            }, dbConnection)



            const magazine_invite_notification = createNotificationMagazine_testing({
                _id: magazine_invite_notification_ID,
                frontData: {
                    magazine: {
                        _id: magazineID.toString(),
                        name: "magazine",
                        ownerType: "group",
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
                        ownerType: "group",
                        groupInviting: {
                            _id: group_id.toString(),
                            name: "group"
                        }
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
            expect(pedro?.magazines.length).toBe(0); // group magazine doesn't add to user magazine array

            const juan = await userModel.findById(juan_id)
            expect(juan?.notifications.length).toBe(1);

            const magazine: any = await magazineModel.findById(magazineID)
            expect(magazine?.allowedCollaborators.length).toBe(0);


        })


        it('Reject invitation Group Magazine without previou notification, should return 400', async () => {
            const juan_id = new Types.ObjectId();
            const pedro_id = new Types.ObjectId();
            const group_id = new Types.ObjectId();
            const magazine_invite_notification_ID = new Types.ObjectId()
            const magazineID = new Types.ObjectId()

            await createTestingGroup_e2e({
                _id: group_id,
                name: "group",
                creator: juan_id,
                magazines: [magazineID]
            }, dbConnection)


            await createGroupMagazine_e2e({
                _id: magazineID,
                group: group_id,
                allowedCollaborators: [],
            }, dbConnection)



            const magazine_invite_notification = createNotificationMagazine_testing({
                _id: magazine_invite_notification_ID,
                frontData: {
                    magazine: {
                        _id: magazineID.toString(),
                        name: "magazine",
                        ownerType: "group",
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
                        ownerType: "group",
                        groupInviting: {
                            _id: group_id.toString(),
                            name: "group"
                        }
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
            expect(pedro?.magazines.length).toBe(0); // group magazine doesn't add to user magazine array

            const juan = await userModel.findById(juan_id)
            expect(juan?.notifications.length).toBe(0);

            const magazine: any = await magazineModel.findById(magazineID)
            expect(magazine?.allowedCollaborators.length).toBe(0);


        })


        it('Remove user from  group magazine (Juan remove Pedro from magazine)', async () => {
            const juan_id = new Types.ObjectId();
            const pedro_id = new Types.ObjectId();
            const group_id = new Types.ObjectId();
            const magazineID = new Types.ObjectId()

            await createTestingGroup_e2e({
                _id: group_id,
                name: "group",
                creator: juan_id,
                magazines: [magazineID]
            }, dbConnection)


            await createGroupMagazine_e2e({
                _id: magazineID,
                group: group_id,
                allowedCollaborators: [pedro_id],
            }, dbConnection)

            const magazine_notification_removed = createNotificationMagazine_testing({
                frontData: {
                    magazine: {
                        _id: magazineID.toString(),
                        name: "magazine",
                        ownerType: "group",
                        groupInviting: {
                            _id: group_id.toString(),
                            name: "group"
                        }
                    }
                },
                event: "notification_magazine_user_has_been_removed",
                backData: {
                    userIdTo: pedro_id.toString(),
                    userIdFrom: juan_id.toString()
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
                .send(magazine_notification_removed)

            expect(response.status).toBe(201);



            const pedro = await userModel.findById(pedro_id)
            expect(pedro?.magazines.length).toBe(0); // group magazine doesn't add to user magazine array
            expect(pedro?.notifications.length).toBe(1);



            const magazine: any = await magazineModel.findById(magazineID)
            expect(magazine?.allowedCollaborators.length).toBe(0);


        })

    })

})