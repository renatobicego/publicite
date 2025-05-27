import { Test } from "@nestjs/testing";
import { connection, Connection, Model, Types } from "mongoose";
import * as request from 'supertest';
import * as dotenv from 'dotenv';

import { AppModule } from "src/app.module";
import { DatabaseService } from "src/contexts/module_shared/database/infrastructure/database.service";
import { createNotification_user, UserRelationType_testing } from "../model/user.notification.test.model";
import createTestingUser_e2e from "../../functions_e2e_testing/create.user";
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { getModelToken } from "@nestjs/mongoose";
import { UserRelationDocument, UserRelationModel } from "src/contexts/module_user/user/infrastructure/schemas/user.relation.schema";
import startServerForE2ETest from "../../../test/getStartede2e-test";




describe('Notification - User RelationShip test', () => {

    let dbConnection: Connection;
    let httpServer: any;
    let app: any;
    let PUBLICITE_SOCKET_API_KEY: string;
    let userModel: Model<IUser>;
    let userRelationModel: Model<UserRelationDocument>


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
        userRelationModel = moduleRef.get<Model<UserRelationDocument>>(getModelToken(UserRelationModel.modelName));
    })

    afterEach(async () => {
        await userModel.deleteMany({});
        await dbConnection.collection('Notifications').deleteMany({});
        await userRelationModel.deleteMany({});
    })
    afterAll(async () => {
        await connection.close();
        await app.close();
    })


    it('Send friend request to user', async () => {

        const userIdTo = new Types.ObjectId();
        const userIdFrom = new Types.ObjectId();

        await createTestingUser_e2e({
            _id: userIdTo,
            username: "test",
            notifications: [],
        }, dbConnection)


        const notification = createNotification_user({
            event: "notification_user_new_friend_request",
            frontData: {
                userRelation: {
                    _id: userIdTo.toString(),
                    userFrom: {
                        _id: userIdFrom.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: null
                }
            },
            backData: {
                userIdTo: userIdTo.toString(),
                userIdFrom: userIdFrom.toString(),
            },
            type: "user_notifications"
        })

        const response = await request(httpServer)
            .post('/socket/user')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification);

        expect(response.status).toBe(201);


        const userThatHasFriendRequest: any = await userModel.findById(userIdTo).populate('friendRequests').populate('notifications')
        if (!userThatHasFriendRequest) {
            throw new Error("User not found")
        }
        expect(userThatHasFriendRequest).toBeTruthy();
        expect(userThatHasFriendRequest.notifications.length).toBe(1);
        expect(userThatHasFriendRequest.notifications[0].event).toBe("notification_user_new_friend_request");
        expect(userThatHasFriendRequest.friendRequests.length).toBe(1);


    })


    it('Send friend request to user when user already has a friend request, should return 304 error', async () => {
        const userIdTo = new Types.ObjectId();
        const userIdFrom = new Types.ObjectId();
        const notificationId = new Types.ObjectId();




        const notification = createNotification_user({
            _id: notificationId,
            event: "notification_user_new_friend_request",
            frontData: {
                userRelation: {
                    _id: userIdTo.toString(),
                    userFrom: {
                        _id: userIdFrom.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: null
                }
            },
            backData: {
                userIdTo: userIdTo.toString(),
                userIdFrom: userIdFrom.toString(),
            },
            type: "user_notifications",
            notificationEntityId: userIdTo.toString() + "notification_user_new_friend_request"
        })

        await dbConnection.collection('Notifications').insertOne(notification);

        await createTestingUser_e2e({
            _id: userIdTo,
            username: "test",
            notifications: [notificationId],
            friendRequests: [notificationId]
        }, dbConnection)


        const response = await request(httpServer)
            .post('/socket/user')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification);

        expect(response.status).toBe(304);


        const userThatHasFriendRequest: any = await userModel.findById(userIdTo).populate('friendRequests').populate('notifications')
        if (!userThatHasFriendRequest) {
            throw new Error("User not found")
        }
        expect(userThatHasFriendRequest).toBeTruthy();
        expect(userThatHasFriendRequest.notifications.length).toBe(1);
        expect(userThatHasFriendRequest.notifications[0].event).toBe("notification_user_new_friend_request");
        expect(userThatHasFriendRequest.friendRequests.length).toBe(1);


    })

    it('Acept friend request', async () => {

        const juan_id = new Types.ObjectId();
        const pedro_id = new Types.ObjectId();
        const notification_friend_request_ID = new Types.ObjectId();
        const notification_friend_request_accepted_ID = new Types.ObjectId();


        //pedro envia solicitud de amistad a juan

        const notification_friend_request = createNotification_user({
            _id: notification_friend_request_ID,
            event: "notification_user_new_friend_request",
            isActionsAvailable: true,
            frontData: {
                userRelation: {
                    _id: juan_id.toString(),
                    userFrom: {
                        _id: pedro_id.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: null
                }
            },
            backData: {
                userIdTo: juan_id.toString(),
                userIdFrom: pedro_id.toString(),
            },
            type: "user_notifications",
            notificationEntityId: juan_id.toString() + "notification_user_new_friend_request"
        })

        await dbConnection.collection('Notifications').insertOne(notification_friend_request);
        await createTestingUser_e2e({
            _id: juan_id,
            username: "test",
            notifications: [notification_friend_request_ID],
            friendRequests: [notification_friend_request_ID]
        }, dbConnection)

        await createTestingUser_e2e({
            _id: pedro_id,
            email: "email@pedro",
            username: "pedro",
            notifications: [],
            friendRequests: []
        }, dbConnection)

        const notification = createNotification_user({
            _id: notification_friend_request_accepted_ID,
            event: "notification_user_friend_request_accepted",
            frontData: {
                userRelation: {
                    _id: juan_id.toString(),
                    userFrom: {
                        _id: pedro_id.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: UserRelationType_testing.friends
                }
            },
            backData: {
                userIdTo: pedro_id.toString(),
                userIdFrom: juan_id.toString(),
            },
            type: "user_notifications",
            notificationEntityId: juan_id.toString() + "notification_user_friend_request_accepted",
            previousNotificationId: notification_friend_request_ID.toString()

        })




        const response = await request(httpServer)
            .post('/socket/user')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification);

        expect(response.status).toBe(201);

        console.log("Verify relation of users")
        const userRelation = await userRelationModel.findOne({ typeRelationA: "friends" })
        expect(userRelation).toBeTruthy();
        expect(userRelation?.typeRelationB).toBe("friends");
        expect(userRelation?.typeRelationA).toBe("friends");
        expect(userRelation?.userA.toString()).toBe(juan_id.toString());
        expect(userRelation?.userB.toString()).toBe(pedro_id.toString());


        const juan = await userModel.findById(juan_id)
        expect(juan?.friendRequests.length).toBe(0);
        expect(juan?.userRelations.length).toBe(1);
        expect(juan?.notifications.length).toBe(1);


        const pedro = await userModel.findById(pedro_id)
        expect(pedro?.friendRequests.length).toBe(0);
        expect(pedro?.userRelations.length).toBe(1);
        expect(pedro?.notifications.length).toBe(1);


        const notification_must_actions_false = await dbConnection.collection('Notifications').findOne({ _id: notification_friend_request_ID })
        expect(notification_must_actions_false?.isActionsAvailable).toBe(false);











    })

    it('Acept friend request, without previous notification, should return a 400 error', async () => {

        const juan_id = new Types.ObjectId();
        const pedro_id = new Types.ObjectId();
        const notification_friend_request_ID = new Types.ObjectId();
        const notification_friend_request_accepted_ID = new Types.ObjectId();


        //pedro envia solicitud de amistad a juan

        const notification_friend_request = createNotification_user({
            _id: notification_friend_request_ID,
            event: "notification_user_new_friend_request",
            isActionsAvailable: true,
            frontData: {
                userRelation: {
                    _id: juan_id.toString(),
                    userFrom: {
                        _id: pedro_id.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: null
                }
            },
            backData: {
                userIdTo: juan_id.toString(),
                userIdFrom: pedro_id.toString(),
            },
            type: "user_notifications",
            notificationEntityId: juan_id.toString() + "notification_user_new_friend_request"
        })

        await dbConnection.collection('Notifications').insertOne(notification_friend_request);
        await createTestingUser_e2e({
            _id: juan_id,
            username: "test",
            notifications: [notification_friend_request_ID],
            friendRequests: [notification_friend_request_ID]
        }, dbConnection)

        await createTestingUser_e2e({
            _id: pedro_id,
            email: "email@pedro",
            username: "pedro",
            notifications: [],
            friendRequests: []
        }, dbConnection)

        const notification = createNotification_user({
            _id: notification_friend_request_accepted_ID,
            event: "notification_user_friend_request_accepted",
            frontData: {
                userRelation: {
                    _id: juan_id.toString(),
                    userFrom: {
                        _id: pedro_id.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: UserRelationType_testing.friends
                }
            },
            backData: {
                userIdTo: pedro_id.toString(),
                userIdFrom: juan_id.toString(),
            },
            type: "user_notifications",
            notificationEntityId: juan_id.toString() + "notification_user_friend_request_accepted",
        })




        const response = await request(httpServer)
            .post('/socket/user')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification);

        expect(response.status).toBe(400);

    })


    it('Reject friend request', async () => {

        const juan_id = new Types.ObjectId();
        const pedro_id = new Types.ObjectId();
        const notification_friend_request_ID = new Types.ObjectId();
        const notification_friend_request_accepted_ID = new Types.ObjectId();

        const notification_friend_request = createNotification_user({
            _id: notification_friend_request_ID,
            event: "notification_user_new_friend_request",
            isActionsAvailable: true,
            frontData: {
                userRelation: {
                    _id: juan_id.toString(),
                    userFrom: {
                        _id: pedro_id.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: null
                }
            },
            backData: {
                userIdTo: juan_id.toString(),
                userIdFrom: pedro_id.toString(),
            },
            type: "user_notifications",
            notificationEntityId: juan_id.toString() + "notification_user_new_friend_request"
        })

        await dbConnection.collection('Notifications').insertOne(notification_friend_request);
        await createTestingUser_e2e({
            _id: juan_id,
            username: "test",
            notifications: [notification_friend_request_ID],
            friendRequests: [notification_friend_request_ID]
        }, dbConnection)

        await createTestingUser_e2e({
            _id: pedro_id,
            email: "email@pedro",
            username: "pedro",
            notifications: [],
            friendRequests: []
        }, dbConnection)

        const notification = createNotification_user({
            _id: notification_friend_request_accepted_ID,
            event: "notification_user_friend_request_rejected",
            frontData: {
                userRelation: {
                    _id: juan_id.toString(),
                    userFrom: {
                        _id: pedro_id.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: UserRelationType_testing.friends
                }
            },
            backData: {
                userIdTo: pedro_id.toString(),
                userIdFrom: juan_id.toString(),
            },
            type: "user_notifications",
            notificationEntityId: juan_id.toString() + "notification_user_friend_request_rejected",
            previousNotificationId: notification_friend_request_ID.toString()

        })




        const response = await request(httpServer)
            .post('/socket/user')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification);

        expect(response.status).toBe(201);

        console.log("Verify relation of users")
        const userRelation = await userRelationModel.findOne({ typeRelationA: "friends" })
        expect(userRelation).not.toBeTruthy();


        const juan = await userModel.findById(juan_id)
        expect(juan?.friendRequests.length).toBe(0);
        expect(juan?.userRelations.length).toBe(0);
        expect(juan?.notifications.length).toBe(1);


        const pedro = await userModel.findById(pedro_id)
        expect(pedro?.friendRequests.length).toBe(0);
        expect(pedro?.userRelations.length).toBe(0);
        expect(pedro?.notifications.length).toBe(1);


        const notification_must_actions_false = await dbConnection.collection('Notifications').findOne({ _id: notification_friend_request_ID })
        expect(notification_must_actions_false?.isActionsAvailable).toBe(false);











    })

    it('Reject friend request, without previous notification, should return a 400 error', async () => {

        const juan_id = new Types.ObjectId();
        const pedro_id = new Types.ObjectId();
        const notification_friend_request_ID = new Types.ObjectId();
        const notification_friend_request_accepted_ID = new Types.ObjectId();

        const notification_friend_request = createNotification_user({
            _id: notification_friend_request_ID,
            event: "notification_user_new_friend_request",
            isActionsAvailable: true,
            frontData: {
                userRelation: {
                    _id: juan_id.toString(),
                    userFrom: {
                        _id: pedro_id.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: null
                }
            },
            backData: {
                userIdTo: juan_id.toString(),
                userIdFrom: pedro_id.toString(),
            },
            type: "user_notifications",
            notificationEntityId: juan_id.toString() + "notification_user_new_friend_request"
        })

        await dbConnection.collection('Notifications').insertOne(notification_friend_request);
        await createTestingUser_e2e({
            _id: juan_id,
            username: "test",
            notifications: [notification_friend_request_ID],
            friendRequests: [notification_friend_request_ID]
        }, dbConnection)

        await createTestingUser_e2e({
            _id: pedro_id,
            email: "email@pedro",
            username: "pedro",
            notifications: [],
            friendRequests: []
        }, dbConnection)

        const notification = createNotification_user({
            _id: notification_friend_request_accepted_ID,
            event: "notification_user_friend_request_rejected",
            frontData: {
                userRelation: {
                    _id: juan_id.toString(),
                    userFrom: {
                        _id: pedro_id.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: UserRelationType_testing.friends
                }
            },
            backData: {
                userIdTo: pedro_id.toString(),
                userIdFrom: juan_id.toString(),
            },
            type: "user_notifications",
            notificationEntityId: juan_id.toString() + "notification_user_friend_request_rejected",


        })




        const response = await request(httpServer)
            .post('/socket/user')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification);

        expect(response.status).toBe(400);

    })


    it('Send request friend relation change -> Friends to TopFriends (Juan request to Pedro)', async () => {
        const juan_id = new Types.ObjectId();
        const pedro_id = new Types.ObjectId();



        const notification_change_relation = createNotification_user({
            event: "notification_user_new_relation_change",
            isActionsAvailable: true,
            frontData: {
                userRelation: {
                    _id: pedro_id.toString(),
                    userFrom: {
                        _id: juan_id.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: UserRelationType_testing.topfriends
                }
            },
            backData: {
                userIdTo: pedro_id.toString(),
                userIdFrom: juan_id.toString(),
            },
            type: "user_notifications",
            notificationEntityId: pedro_id.toString() + "notification_user_new_relation_change"
        })


        await createTestingUser_e2e({
            _id: pedro_id,
            email: "email@pedro",
            username: "pedro",
            userRelations: [new Types.ObjectId()],
            friendRequests: []
        }, dbConnection)



        const response = await request(httpServer)
            .post('/socket/user')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification_change_relation);

        expect(response.status).toBe(201);


        const pedro = await userModel.findById(pedro_id)
        expect(pedro?.friendRequests.length).toBe(1);
        expect(pedro?.userRelations.length).toBe(1);
        expect(pedro?.notifications.length).toBe(1);



    })


    it('Accept request friend relation change -> Friends to TopFriends (Pedro response to Juan)', async () => {
        const juan_id = new Types.ObjectId();
        const pedro_id = new Types.ObjectId();
        const notification_change_relation_id = new Types.ObjectId();

        const oldRelationShip = {
            _id: new Types.ObjectId(),
            userA: juan_id,
            userB: pedro_id,
            typeRelationA: "friends",
            typeRelationB: "friends"
        }
        await userRelationModel.create(oldRelationShip);

        const notification_change_relation = createNotification_user({
            _id: notification_change_relation_id,
            event: "notification_user_new_relation_change",
            isActionsAvailable: true,
            frontData: {
                userRelation: {
                    _id: "oldRelationShip._id.toString()",
                    userFrom: {
                        _id: juan_id.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: UserRelationType_testing.topfriends
                }
            },
            backData: {
                userIdTo: pedro_id.toString(),
                userIdFrom: juan_id.toString(),
            },
            type: "user_notifications",
            notificationEntityId: juan_id.toString() + "notification_user_new_relation_change"
        })


        await dbConnection.collection('Notifications').insertOne(notification_change_relation);



        const notification_change_relation_ACCEPTED = createNotification_user({
            event: "notification_user_new_relation_accepted",
            isActionsAvailable: true,
            frontData: {
                userRelation: {
                    _id: oldRelationShip._id.toString(),
                    userFrom: {
                        _id: pedro_id.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: UserRelationType_testing.topfriends
                }
            },
            backData: {
                userIdTo: juan_id.toString(),
                userIdFrom: pedro_id.toString(),
            },
            type: "user_notifications",
            notificationEntityId: pedro_id.toString() + "notification_user_new_relation_accepted",
            previousNotificationId: notification_change_relation._id?.toString()
        })

        await createTestingUser_e2e({
            _id: juan_id,
            username: "test",
            notifications: [],
            friendRequests: [],
            userRelations: [oldRelationShip._id]
        }, dbConnection)

        await createTestingUser_e2e({
            _id: pedro_id,
            email: "email@pedro",
            username: "pedro",
            notifications: [],
            friendRequests: [notification_change_relation_id],
            userRelations: [oldRelationShip._id]
        }, dbConnection)




        const response = await request(httpServer)
            .post('/socket/user')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification_change_relation_ACCEPTED);


        expect(response.status).toBe(201);

        const pedro = await userModel.findById(pedro_id)
        expect(pedro?.friendRequests.length).toBe(0);
        expect(pedro?.userRelations.length).toBe(1);
        expect(pedro?.notifications.length).toBe(0);


        const juan = await userModel.findById(juan_id)
        expect(juan?.friendRequests.length).toBe(0);
        expect(juan?.userRelations.length).toBe(1);
        expect(juan?.notifications.length).toBe(1);

        const newRelation = await userRelationModel.findOne({ $or: [{ userA: juan_id }, { userB: juan_id }] })
        expect(newRelation).toBeTruthy();
        expect(newRelation?.typeRelationA).toBe(UserRelationType_testing.topfriends);
        expect(newRelation?.typeRelationB).toBe(UserRelationType_testing.topfriends);
        expect(newRelation?.userA.toString()).toBe(juan_id.toString());
        expect(newRelation?.userB.toString()).toBe(pedro_id.toString());


        const notification_must_actions_false = await dbConnection.collection('Notifications').findOne({ _id: notification_change_relation_id })
        expect(notification_must_actions_false?.isActionsAvailable).toBe(false);




    })


    it('Reject request friend relation change -> Friends to TopFriends (Pedro response to Juan)', async () => {
        const juan_id = new Types.ObjectId();
        const pedro_id = new Types.ObjectId();
        const notification_change_relation_id = new Types.ObjectId();

        const oldRelationShip = {
            _id: new Types.ObjectId(),
            userA: juan_id,
            userB: pedro_id,
            typeRelationA: "friends",
            typeRelationB: "friends"
        }
        await userRelationModel.create(oldRelationShip);

        const notification_change_relation = createNotification_user({
            _id: notification_change_relation_id,
            event: "notification_user_new_relation_change",
            isActionsAvailable: true,
            frontData: {
                userRelation: {
                    _id: "oldRelationShip._id.toString()",
                    userFrom: {
                        _id: juan_id.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: UserRelationType_testing.topfriends
                }
            },
            backData: {
                userIdTo: pedro_id.toString(),
                userIdFrom: juan_id.toString(),
            },
            type: "user_notifications",
            notificationEntityId: juan_id.toString() + "notification_user_new_relation_change"
        })


        await dbConnection.collection('Notifications').insertOne(notification_change_relation);



        const notification_change_relation_ACCEPTED = createNotification_user({
            event: "notifications_user_new_relation_rejected",
            isActionsAvailable: true,
            frontData: {
                userRelation: {
                    _id: oldRelationShip._id.toString(),
                    userFrom: {
                        _id: pedro_id.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: UserRelationType_testing.topfriends
                }
            },
            backData: {
                userIdTo: juan_id.toString(),
                userIdFrom: pedro_id.toString(),
            },
            type: "user_notifications",
            notificationEntityId: pedro_id.toString() + "notifications_user_new_relation_rejected",
            previousNotificationId: notification_change_relation._id?.toString()
        })

        await createTestingUser_e2e({
            _id: juan_id,
            username: "test",
            notifications: [],
            friendRequests: [],
            userRelations: [oldRelationShip._id]
        }, dbConnection)

        await createTestingUser_e2e({
            _id: pedro_id,
            email: "email@pedro",
            username: "pedro",
            notifications: [],
            friendRequests: [notification_change_relation_id],
            userRelations: [oldRelationShip._id]
        }, dbConnection)




        const response = await request(httpServer)
            .post('/socket/user')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification_change_relation_ACCEPTED);


        expect(response.status).toBe(201);

        const pedro = await userModel.findById(pedro_id)
        expect(pedro?.friendRequests.length).toBe(0);
        expect(pedro?.userRelations.length).toBe(1);
        expect(pedro?.notifications.length).toBe(0);


        const juan = await userModel.findById(juan_id)
        expect(juan?.friendRequests.length).toBe(0);
        expect(juan?.userRelations.length).toBe(1);
        expect(juan?.notifications.length).toBe(1);

        const newRelation = await userRelationModel.findOne({ $or: [{ userA: juan_id }, { userB: juan_id }] })
        expect(newRelation).toBeTruthy();
        expect(newRelation?.typeRelationA).toBe(UserRelationType_testing.friends);
        expect(newRelation?.typeRelationB).toBe(UserRelationType_testing.friends);
        expect(newRelation?.userA.toString()).toBe(juan_id.toString());
        expect(newRelation?.userB.toString()).toBe(pedro_id.toString());


        const notification_must_actions_false = await dbConnection.collection('Notifications').findOne({ _id: notification_change_relation_id })
        expect(notification_must_actions_false?.isActionsAvailable).toBe(false);




    })



    it('Reject request friend relation change without previous notification, should return 400 error', async () => {
        const juan_id = new Types.ObjectId();
        const pedro_id = new Types.ObjectId();
        const notification_change_relation_id = new Types.ObjectId();

        const oldRelationShip = {
            _id: new Types.ObjectId(),
            userA: juan_id,
            userB: pedro_id,
            typeRelationA: "friends",
            typeRelationB: "friends"
        }
        await userRelationModel.create(oldRelationShip);

        const notification_change_relation = createNotification_user({
            _id: notification_change_relation_id,
            event: "notification_user_new_relation_change",
            isActionsAvailable: true,
            frontData: {
                userRelation: {
                    _id: "oldRelationShip._id.toString()",
                    userFrom: {
                        _id: juan_id.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: UserRelationType_testing.topfriends
                }
            },
            backData: {
                userIdTo: pedro_id.toString(),
                userIdFrom: juan_id.toString(),
            },
            type: "user_notifications",
            notificationEntityId: juan_id.toString() + "notification_user_new_relation_change"
        })


        await dbConnection.collection('Notifications').insertOne(notification_change_relation);



        const notification_change_relation_ACCEPTED = createNotification_user({
            event: "notifications_user_new_relation_rejected",
            isActionsAvailable: true,
            frontData: {
                userRelation: {
                    _id: oldRelationShip._id.toString(),
                    userFrom: {
                        _id: pedro_id.toString(),
                        username: "Maxi",
                        profilePhotoUrl: "maxi.png"
                    },
                    typeRelation: UserRelationType_testing.topfriends
                }
            },
            backData: {
                userIdTo: juan_id.toString(),
                userIdFrom: pedro_id.toString(),
            },
            type: "user_notifications",
            notificationEntityId: pedro_id.toString() + "notifications_user_new_relation_rejected",
            previousNotificationId: null
        })

        await createTestingUser_e2e({
            _id: juan_id,
            username: "test",
            notifications: [],
            friendRequests: [],
            userRelations: [oldRelationShip._id]
        }, dbConnection)

        await createTestingUser_e2e({
            _id: pedro_id,
            email: "email@pedro",
            username: "pedro",
            notifications: [],
            friendRequests: [notification_change_relation_id],
            userRelations: [oldRelationShip._id]
        }, dbConnection)




        const response = await request(httpServer)
            .post('/socket/user')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification_change_relation_ACCEPTED);


        expect(response.status).toBe(400);

        const pedro = await userModel.findById(pedro_id)
        expect(pedro?.friendRequests.length).toBe(1);
        expect(pedro?.userRelations.length).toBe(1);
        expect(pedro?.notifications.length).toBe(0);


        const juan = await userModel.findById(juan_id)
        expect(juan?.friendRequests.length).toBe(0);
        expect(juan?.userRelations.length).toBe(1);
        expect(juan?.notifications.length).toBe(0);

        const newRelation = await userRelationModel.findOne({ $or: [{ userA: juan_id }, { userB: juan_id }] })
        expect(newRelation).toBeTruthy();
        expect(newRelation?.typeRelationA).toBe(UserRelationType_testing.friends);
        expect(newRelation?.typeRelationB).toBe(UserRelationType_testing.friends);
        expect(newRelation?.userA.toString()).toBe(juan_id.toString());
        expect(newRelation?.userB.toString()).toBe(pedro_id.toString());


        const notification_must_actions_false = await dbConnection.collection('Notifications').findOne({ _id: notification_change_relation_id })
        expect(notification_must_actions_false?.isActionsAvailable).toBe(true);




    })

})

