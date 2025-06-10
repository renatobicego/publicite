import { Connection, Model, Types } from 'mongoose';
import { GroupService } from 'src/contexts/module_group/group/application/service/group.service';

import createTestingGroup_e2e from '../functions_e2e_testing/create.group';
import createTestingNotification_e2e from '../functions_e2e_testing/createNotification';
import createTestingUser_e2e, { UserType_test } from '../functions_e2e_testing/create.user';
import startServerForE2ETest from '../../test/getStartede2e-test';
import { TestingModule } from '@nestjs/testing';
import { GroupDocument } from 'src/contexts/module_group/group/infrastructure/schemas/group.schema';
import { getModelToken } from '@nestjs/mongoose';





enum Visibility {
    public = 'public',
    contacts = 'contacts',
    friends = 'friends',
    topfriends = 'topfriends',
}


let dbConnection: Connection;
let httpServer: any;
let app: any;
let moduleRef: TestingModule;

async function findById(id: any, collection: any, dbConnection: Connection) {
    try {
        return await dbConnection.collection(collection).findOne({ _id: id })
    } catch (error: any) {
        console.log("Problem with test find")
        throw error;
    }
}



describe('Group Service Invitations', () => {

    let groupService: GroupService;
    let groupModel: Model<GroupDocument>
    const groupId = new Types.ObjectId("66d2177dda11f93d8647cf3b");
    const users = [
        new Types.ObjectId("66c5a1b0e80296e90ec638a1"),
        new Types.ObjectId("66c5a1b0e80296e90ec638a2"),
        new Types.ObjectId("66c5a1b0e80296e90ec638a3"),
        new Types.ObjectId("66c5a1b0e80296e90ec638a4"),
    ]


    beforeAll(async () => {
        const {
            databaseConnection,
            application,
            server,
            module } = await startServerForE2ETest();
        moduleRef = module
        dbConnection = databaseConnection
        app = application
        httpServer = server

        groupService = moduleRef.get<GroupService>("GroupServiceInterface");
        groupModel = moduleRef.get<Model<GroupDocument>>(getModelToken("Group"));

    });



    afterAll(async () => {
        await dbConnection.close();
        await app.close();
    })

    afterEach(async () => {
        await dbConnection.collection('users').deleteMany({});
        await dbConnection.collection('groups').deleteMany({});
        await dbConnection.collection('Notifications').deleteMany({});
    });





    it('Push notification to group - notification_group_new_user_invited', async () => {
        const userId_2 = "67cf3e1306834d3262313c40"
        const groupCreated = await createTestingGroup_e2e({
            _id: new Types.ObjectId(),
            alias: "hola22",
            members: [users[0]],
            admins: [],
            groupNotificationsRequest: {
                joinRequests: [],
                groupInvitations: []
            },
            creator: users[0],
            magazines: [],
            visibility: Visibility.public,
            name: "hola",
            userIdAndNotificationMap: new Map<string, string>(
                [[userId_2, "notification_id_test_23"]]
            )

        }, dbConnection)

        const backData = {
            userIdTo: users[1],
            userIdFrom: users[0],
        }
        const event = "notification_group_new_user_invited"
        let group = await groupModel.findById(groupCreated._id);
        console.log(group)

        await groupService.handleNotificationGroupAndSendToGroup(
            groupCreated._id.toString(),
            backData,
            event,
            null,
            "notification_id_test"
        )
        group = await groupModel.findById(groupCreated._id);
        console.log(group)
        expect(group!.groupNotificationsRequest.groupInvitations.length).toBe(1)
        expect(group!.groupNotificationsRequest.groupInvitations[0].toString()).toEqual(backData.userIdTo.toString())
        expect(group!.userIdAndNotificationMap.get(backData.userIdTo.toString())).toEqual("notification_id_test")
        expect(group!.userIdAndNotificationMap.get(userId_2)).toEqual("notification_id_test_23")
    })



    it('Push notification to group - notification_group_new_user_added', async () => {
        const notificationId = new Types.ObjectId("66d2177dda11f93d8647cf3f");
        const userInvited = users[3]

        const notificationMap = new Map<string, string>(
            [
                [userInvited.toString(), notificationId.toString()]
            ]
        );
        const backData = {
            userIdTo: users[1],
            userIdFrom: userInvited,
        }

        await createTestingNotification_e2e({
            _id: notificationId,
            event: "notification_group_new_user_invited",
            viewed: false,
            date: "2025-03-01T15:24:08.925+00:00",
            user: userInvited.toString(),
            isActionsAvailable: true,
            backData: {
                userIdTo: backData.userIdTo.toString(),
                userIdFrom: backData.userIdFrom.toString(),
            },
            socketJobId: "d11fd3ca-94a0-4dfe-b659-c72f2d49d5f0",
            type: "group_notifications",
            notificationEntityId: "notification_group_new_user_invited67420686b02bdd1f9f0ef44667164bd032f..",
            previousNotificationId: null,
            kind: "NotificationGroup",
            frontData: {
                group: {
                    _id: new Types.ObjectId(),
                    name: "Grupo de Prueba",
                    profilePhotoUrl: "https://example.com/group-photo.jpg"
                },
                userInviting: {
                    _id: new Types.ObjectId(),
                    username: "usuario_invitador"
                }
            }
        }, dbConnection)

        await createTestingGroup_e2e({
            _id: groupId,
            alias: "hola22",
            members: [users[1]],
            admins: [],
            groupNotificationsRequest: {
                joinRequests: [],
                groupInvitations: [userInvited]
            },
            creator: users[0],
            magazines: [],
            visibility: Visibility.public,
            name: "hola",
            userIdAndNotificationMap: notificationMap

        }, dbConnection)
        await createTestingUser_e2e({
            _id: userInvited,
            clerkId: "123",
            email: "email",
            username: "username",
            name: "name",
            lastName: "lastName",
            finder: "finder",
            profilePhotoUrl: "profilePhotoUrl",
            userType: UserType_test.Person,
            groups: [],

        }, dbConnection)


        const event = "notification_group_new_user_added"


        await groupService.handleNotificationGroupAndSendToGroup(
            groupId.toString(),
            backData,
            event,
            null,
            notificationId.toString(),
        )

        const group = await findById(groupId, "groups", dbConnection);
        const notification = await findById(notificationId, "Notifications", dbConnection);
        expect(group!.groupNotificationsRequest.groupInvitations.length).toBe(0)
        expect(group!.members[1].toString()).toEqual(userInvited.toString())
        expect(group!.userIdAndNotificationMap).toEqual({})
        expect(notification!.isActionsAvailable).toBe(false)
    })



    it('Push notification to group - notification_group_user_rejected_group_invitation', async () => {
        const userInvited = users[3]
        const notificationId = new Types.ObjectId("66d2177dda11f93d8647cf3f");

        const notificationMap = new Map<string, string>(
            [
                [userInvited.toString(), notificationId.toString()]
            ]
        );
        await createTestingGroup_e2e({
            _id: groupId,
            alias: "hola22",
            members: [],
            admins: [],
            groupNotificationsRequest: {
                joinRequests: [],
                groupInvitations: [userInvited]
            },
            creator: users[0],
            magazines: [],
            visibility: Visibility.public,
            name: "hola",
            userIdAndNotificationMap: notificationMap

        }, dbConnection)
        await createTestingNotification_e2e({
            _id: notificationId,
            event: "test",
            viewed: false,
            date: "2025-03-01T15:24:08.925+00:00",
            user: userInvited.toString(),
            isActionsAvailable: true,
            backData: {
                userIdTo: "backData.userIdTo.toString()",
                userIdFrom: " backData.userIdFrom.toString()",
            },
            socketJobId: "d11fd3ca-94a0-4dfe-b659-c72f2d49d5f0",
            type: "group_notifications",
            notificationEntityId: "notification_group_new_user_invited67420686b02bdd1f9f0ef44667164bd032f..",
            previousNotificationId: null,
            kind: "NotificationGroup",
            frontData: {
                group: {
                    _id: new Types.ObjectId(),
                    name: "Grupo de Prueba",
                    profilePhotoUrl: "https://example.com/group-photo.jpg"
                },
                userInviting: {
                    _id: new Types.ObjectId(),
                    username: "usuario_invitador"
                }
            }
        }, dbConnection)

        const event = "notification_group_user_rejected_group_invitation"
        const backData = {
            userIdTo: "test",
            userIdFrom: userInvited.toString()
        }
        await groupService.handleNotificationGroupAndSendToGroup(
            groupId.toString(),
            backData,
            event,
            null,
            notificationId.toString(),
        )

        const group = await findById(groupId, "groups", dbConnection);
        const notification = await findById(notificationId, "Notifications", dbConnection);
        expect(group!.groupNotificationsRequest.groupInvitations.length).toBe(0)
        expect(group!.members.length).toBe(0)
        expect(group!.userIdAndNotificationMap).toEqual({})
        expect(notification!.isActionsAvailable).toBe(false)

    })

    it('Push notification to group - notification_group_user_request_group_invitation', async () => {
        const userInvited = users[3]



        await createTestingGroup_e2e({
            _id: groupId,
            alias: "hola22",
            members: [],
            admins: [],
            groupNotificationsRequest: {
                joinRequests: [],
                groupInvitations: []
            },
            creator: users[0],
            magazines: [],
            visibility: Visibility.public,
            name: "hola",


        }, dbConnection)


        const event = "notification_group_user_request_group_invitation"
        const backData = {
            userIdTo: "test",
            userIdFrom: userInvited.toString(),
        }
        await groupService.handleNotificationGroupAndSendToGroup(
            groupId.toString(),
            backData,
            event,
            null,

        )

        const group = await findById(groupId, "groups", dbConnection);

        expect(group!.groupNotificationsRequest.groupInvitations.length).toBe(0)
        expect(group!.groupNotificationsRequest.joinRequests.length).toBe(1)
        expect(group!.members.length).toBe(0)



    })


})
