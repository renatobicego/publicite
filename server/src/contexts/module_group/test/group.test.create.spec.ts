import { TestingModule } from "@nestjs/testing";
import mapModuleTesting from "./group.test.module";
import { getModelToken } from "@nestjs/mongoose";
import { Model, ObjectId, Types } from "mongoose";
import { UnauthorizedException } from "@nestjs/common";


import { GroupDocument } from "../group/infrastructure/schemas/group.schema";
import { GroupService } from "../group/application/service/group.service";
import { createPersonalUser, PersonalAccountTestRequest } from "../../../../test/functions/create.user";
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { createGroup, GroupTestRequest } from "../../../../test/functions/create.group";
import { MagazineDocument } from "src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.schema";
import { GroupMagazineDocument } from "src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.group.schema";
import { createGroupMagazine, createSection } from "../../../../test/functions/create.magazine";
import { MagazineSectionDocument } from "src/contexts/module_magazine/magazine/infrastructure/schemas/section/magazine.section.schema";
import { INotificationGroup } from "src/contexts/module_user/notification/infrastructure/schemas/notification.group.schema";
import { GroupRepository } from "../group/infrastructure/repository/group.repository";
enum Visibility {
    public = 'public',
    private = 'private',
}


interface groupRequest {
    members: ObjectId[],
    admins: ObjectId[],
    name: string,
    alias: string,
    rules: string,
    magazines: ObjectId[],
    details: string,
    profilePhotoUrl: string,
    visibility: Visibility,
    groupNote: string
}



describe('GROUP TEST SERVICE', () => {
    let groupModel: Model<GroupDocument>
    let userModel: Model<IUser>
    let magazineGroupModel: Model<GroupMagazineDocument>
    let magazineModel: Model<MagazineDocument>
    let sectionModel: Model<MagazineSectionDocument>
    let notificationModel: Model<INotificationGroup>
    let groupService: GroupService;
    let groupRepository: GroupRepository;

    const groupId = new Types.ObjectId("66c49508e80296e90ec637d7");
    const groupCreator = new Types.ObjectId("66c49508e80296e90ec637d8");
    const users = [
        new Types.ObjectId("66c49508e80296e90ec637d9"),
        new Types.ObjectId("66c49508e80296e90ec637d1"),
        new Types.ObjectId("66c49508e80296e90ec637d2"),

        new Types.ObjectId("66c49508e80296e90ec637d4"),
        new Types.ObjectId("66c49508e80296e90ec637d5"),
        new Types.ObjectId("66c49508e80296e90ec637d6"),
    ]
    const groupMagazines = [
        new Types.ObjectId("66c49508e80294e90ec637d4"),
        new Types.ObjectId("66c49508e80294e90ec637d5"),
        new Types.ObjectId("66c49508e80294e90ec637d6"),
    ]


    beforeAll(async () => {
        const moduleRef: TestingModule = await mapModuleTesting.get("group")();
        groupModel = moduleRef.get<Model<GroupDocument>>(getModelToken("Group"));
        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        sectionModel = moduleRef.get<Model<MagazineSectionDocument>>(getModelToken("MagazineSection"));
        magazineGroupModel = moduleRef.get<Model<GroupMagazineDocument>>(getModelToken("GroupMagazine"));
        magazineModel = moduleRef.get<Model<MagazineDocument>>(getModelToken("Magazine"));
        notificationModel = moduleRef.get<Model<INotificationGroup>>(getModelToken("NotificationGroup"));
        groupService = moduleRef.get<GroupService>('GroupServiceInterface');
        groupRepository = moduleRef.get<GroupRepository>('GroupRepositoryInterface');

    })

    afterEach(async () => {
        await userModel.deleteMany({});
        await groupModel.deleteMany({});
        await sectionModel.deleteMany({});
        await notificationModel.deleteMany({});
    })

    afterEach(async () => {
        await magazineModel.deleteMany({});

    })




    describe('Create a group', () => {
        it('Create group with unique alias and verify that group is in user array', async () => {
            const userRequest: PersonalAccountTestRequest = {
                _id: users[0],
            }
            await createPersonalUser(userModel, userRequest);
            const groupRequest: groupRequest = {
                members: [],
                admins: [],
                name: "Grupo testing",
                alias: "test_alias",
                rules: "nothing here",
                magazines: [],
                details: "details",
                profilePhotoUrl: "www.test.com",
                visibility: Visibility.public,
                groupNote: "Hello world",


            }

            const groupExpected = {
                ...groupRequest,
                groupNotificationsRequest: {
                    joinRequests: [],
                    groupInvitations: [],
                },
                creator: users[0],


            }


            await groupService.saveGroup(groupRequest, users[0].toString());
            const groupSaved = await groupModel.findOne({ alias: "test_alias" });

            expect(groupSaved).toBeDefined();
            expect(groupSaved?.members).toEqual(groupExpected.members);
            expect(groupSaved?.admins).toEqual(groupExpected.admins);
            expect(groupSaved?.name).toEqual(groupExpected.name);
            expect(groupSaved?.alias).toEqual(groupExpected.alias);
            expect(groupSaved?.rules).toEqual(groupExpected.rules);
            expect(groupSaved?.magazines).toEqual(groupExpected.magazines);
            expect(groupSaved?.details).toEqual(groupExpected.details);
            expect(groupSaved?.profilePhotoUrl).toEqual(groupExpected.profilePhotoUrl);
            expect(groupSaved?.visibility).toEqual(groupExpected.visibility);
            expect(groupSaved?.groupNotificationsRequest).toEqual(groupExpected.groupNotificationsRequest);
            expect(groupSaved?.groupNote).toEqual(groupExpected.groupNote);

            console.log("Verify if group is in the user arraytest")
            const user = await userModel.findById(users[0]);
            expect(user?.groups).toContainEqual(groupSaved?._id);

        })


        it('Create group with same alias, should return error', async () => {

            const request = {
                _id: groupId,
                creator: groupCreator,
                visibility: Visibility.public,
                alias: "hola"
            }
            await createGroup(request, groupModel);
            const groupRequest: groupRequest = {
                members: [],
                admins: [],
                name: "Grupo testing",
                alias: "hola",
                rules: "nothing here",
                magazines: [],
                details: "details",
                profilePhotoUrl: "www.test.com",
                visibility: Visibility.public,
                groupNote: "Hello world",


            }

            const groupExpected = {
                ...groupRequest,
                groupNotificationsRequest: {
                    joinRequests: [],
                    groupInvitations: [],
                },
                creator: groupCreator,


            }
            await expect(groupService.saveGroup(groupRequest, groupCreator.toString())).rejects.toThrowError(
                new RegExp('duplicate key error')
            );

            const groupSaved = await groupModel.find({ alias: "hola" });
            expect(groupSaved.length).toBe(1);


        })

        it('Create group with alias with space, should create with no space', async () => {


            const name = "TEST WITHOUT SPACE"
            const groupRequest: groupRequest = {
                members: [],
                admins: [],
                name: name,
                alias: "esto es un alias con espacios",
                rules: "nothing here",
                magazines: [],
                details: "details",
                profilePhotoUrl: "www.test.com",
                visibility: Visibility.public,
                groupNote: "Hello world",
            }

            const aliasWithOutSpaces = groupRequest.alias.replace(/\s+/g, '').toLowerCase();


            await groupService.saveGroup(groupRequest, groupCreator.toString());
            const groupSaved = await groupModel.findOne({ name });
            if (!groupSaved) throw new Error('Group not found');
            expect(groupSaved.alias).toBe(aliasWithOutSpaces);



        })
    })



    describe('Add admin to a group..', () => {
        it('Set admin to group being creator, Should it be in the admin array and remove from members array', async () => {

            const groupRequest: GroupTestRequest = {
                _id: groupId,
                creator: groupCreator,
                visibility: Visibility.public,
                alias: "hola",
                admins: [],
                members: [users[1]],

            }
            await createGroup(groupRequest, groupModel);
            await groupService.addAdminToGroup(groupRequest.members![0].toString(), groupId.toString(), groupCreator.toString());




            const group = await groupModel.findOne({ _id: groupId });
            if (!group) throw new Error('Group not found');
            expect(group.members.length).toBe(0);
            expect(group.admins.length).toBe(1);
            expect(group.admins[0].toString()).toEqual([users[1]].toString());





        })

        it('Set admin to group being admin, Should it be in the admin array and remove from members array', async () => {

            const groupRequest = {
                _id: groupId,
                creator: groupCreator,
                visibility: Visibility.public,
                alias: "hola",
                admins: [users[0]],
                members: [users[1]],

            }

            await createGroup(groupRequest, groupModel);
            await groupService.addAdminToGroup(groupRequest.members.toString(), groupId.toString(), groupRequest.admins.toString());


            const group = await groupModel.findOne({ _id: groupId });
            if (!group) throw new Error('Group not found');
            expect(group.members.length).toBe(0);
            expect(group.admins.length).toBe(2);


        })

        it('Set admin being a member, Should return permissions error', async () => {

            const groupRequest = {
                _id: groupId,
                creator: groupCreator,
                visibility: Visibility.public,
                alias: "hola",
                admins: [],
                members: [users[1], users[2]],
            }

            await createGroup(groupRequest, groupModel);


            await expect(
                groupService.addAdminToGroup(
                    users[2].toString(),
                    groupId.toString(),
                    users[1].toString()
                )
            ).rejects.toThrow(UnauthorizedException);
            const group = await groupModel.findOne({ _id: groupId });
            if (!group) throw new Error('Group not found');
            expect(group.members.length).toBe(2);
            expect(group.admins.length).toBe(0);


        })
    })


    describe('Delete a group and delete magazines from group', () => {



        it('Delete group, should delete group of members array and magazine groups and sections of these magazines', async () => {

            const sectionId = new Types.ObjectId("66c49508e80293e90ec637d9");
            const sectionId2 = new Types.ObjectId("66c49508e80294e90ec637d9");
            const magazineId = new Types.ObjectId("66c49508e80294e90ec637d4");



            const groupRequest = {
                _id: groupId,
                creator: groupCreator,
                visibility: Visibility.public,
                alias: "Crazy alias",
                admins: users.slice(0, 3),
                members: users.slice(3),
            }
            await createGroup(groupRequest, groupModel,);
            await createSection(sectionId, sectionModel, [], true)
            await createSection(sectionId2, sectionModel, [], false)
            await createGroupMagazine(magazineId, magazineGroupModel, groupId, [sectionId, sectionId2], []);

            users.push(groupCreator);
            for (let i = 0; i < users.length; i++) {
                await createPersonalUser(userModel, { _id: users[i], groups: [groupId] } as PersonalAccountTestRequest)
            }


            let user = await userModel.find({ groups: groupId });
            if (!user) throw new Error('User not found');
            expect(user.length).toBe(7);
            let section = await sectionModel.find();
            expect(section.length).toBe(2);

            console.log("Deleting group...")
            await groupService.deleteGroupById(groupId.toString(), groupCreator.toString());

            const group = await groupModel.findById({ _id: groupId });
            expect(group).toBe(null);
            console.log("group deleted successfully");

            console.log("Deleting Magazine group...")
            const magazine = await magazineGroupModel.find({ _id: magazineId });
            expect(magazine.length).toBe(0);
            console.log("Magazine group deleted successfully");

            section = await sectionModel.find();
            console.log(section)
            expect(section.length).toBe(0);
            console.log("Section deleted successfully");

            user = await userModel.find({ groups: groupId });
            expect(user.length).toBe(0);
            console.log("User groups array pull successfully");



        })

        it('Delete Magazines from group being a member, should not affect group', async () => {

            const groupRequest: GroupTestRequest = {
                _id: groupId,
                creator: groupCreator,
                visibility: Visibility.public,
                alias: "hola",
                admins: [],
                members: [users[1]],
                magazines: groupMagazines
            }
            await createGroup(groupRequest, groupModel);

            let group = await groupModel.findById({ _id: groupId });
            expect(group?.magazines.length).toBe(3)

            await expect(groupService.deleteMagazinesFromGroup(
                [
                    groupMagazines[0].toString(),
                    groupMagazines[1].toString(),
                    groupMagazines[2].toString(),
                ],
                groupId.toString(),
                groupRequest.members![0].toString(),
            )).rejects.toThrow(UnauthorizedException);

            group = await groupModel.findById({ _id: groupId });
            expect(group).not.toBe(null);
            expect(group?.magazines.length).toBe(3)



        })


        it('Delete Magazines from group being a admin, should return work successfully', async () => {
            const groupRequest: GroupTestRequest = {
                _id: groupId,
                creator: groupCreator,
                visibility: Visibility.public,
                alias: "hola",
                admins: [users[1]],
                members: [],
                magazines: groupMagazines
            }

            await createGroup(groupRequest, groupModel,);

            let group = await groupModel.findById({ _id: groupId });
            expect(group?.magazines.length).toBe(3)

            await groupService.deleteMagazinesFromGroup(
                [
                    groupMagazines[0].toString(),
                    groupMagazines[1].toString(),
                    groupMagazines[2].toString(),
                ],
                groupId.toString(),
                groupRequest.admins![0].toString(),
            );

            group = await groupModel.findById({ _id: groupId });
            expect(group).not.toBe(null);
            expect(group?.magazines.length).toBe(0)


        })


        it('Delete Magazines from group being a creator, should return work successfully', async () => {

            const groupRequest: GroupTestRequest = {
                _id: groupId,
                creator: groupCreator,
                visibility: Visibility.public,
                alias: "hola",
                admins: [],
                members: [],
                magazines: groupMagazines
            }

            await createGroup(groupRequest, groupModel);

            let group = await groupModel.findById({ _id: groupId });
            expect(group?.magazines.length).toBe(3)

            await groupService.deleteMagazinesFromGroup(
                [
                    groupMagazines[0].toString(),
                    groupMagazines[1].toString(),
                    groupMagazines[2].toString(),
                ],
                groupId.toString(),
                groupCreator.toString(),
            );

            group = await groupModel.findById({ _id: groupId });
            expect(group).not.toBe(null);
            expect(group?.magazines.length).toBe(0)

        })


    })


    describe('Exit group', () => {
        it('Exit group being member', async () => {
            const logExpected = jest.spyOn(groupService.getLogger, 'log');
            const groupRequest = {
                _id: groupId,
                creator: groupCreator,
                visibility: Visibility.public,
                alias: "hola",
                admins: [],
                members: [users[1]],
                magazines: groupMagazines
            }
            await createGroup(groupRequest, groupModel);
            const userRequest: PersonalAccountTestRequest = {
                _id: groupRequest.members![0],
                groups: [groupId]
            }
            await createPersonalUser(userModel, userRequest)


            let group = await groupModel.findById({ _id: groupId });
            expect(group).not.toBe(null);
            expect(group?.members.length).toBe(1)
            const groupExitRequest = {
                groupId: groupId.toString(),
                member: groupRequest.members![0].toString(),
            }

            await groupService.exitGroupById(
                groupExitRequest
            );

            group = await groupModel.findById({ _id: groupId });
            expect(group).not.toBe(null);
            expect(group?.members.length).toBe(0)

            expect(logExpected).toHaveBeenCalledWith(`Exiting group member or admin`);

        })

        it('Exit group being admin', async () => {
            const logExpected = jest.spyOn(groupService.getLogger, 'log');
            const groupRequest: GroupTestRequest = {
                _id: groupId,
                creator: groupCreator,
                visibility: Visibility.public,
                alias: "hola",
                admins: [users[1]],
                members: [],
                magazines: groupMagazines
            }
            await createGroup(groupRequest, groupModel);
            const userRequest: PersonalAccountTestRequest = {
                _id: users[1],
                groups: [groupId]
            }
            await createPersonalUser(userModel, userRequest)


            let group = await groupModel.findById({ _id: groupId });
            expect(group).not.toBe(null);
            expect(group?.admins.length).toBe(1)

            const groupExitRequest = {
                groupId: groupId.toString(),
                member: groupRequest.admins![0].toString(), // could be admin or member 
            }


            await groupService.exitGroupById(
                groupExitRequest
            );

            group = await groupModel.findById({ _id: groupId });
            expect(group).not.toBe(null);
            expect(group?.admins.length).toBe(0)

            expect(logExpected).toHaveBeenCalledWith(`Exiting group member or admin`);

        })

        it('Exit group being creator and not assing a new creator, should return an error', async () => {
            const groupRequest: GroupTestRequest = {
                _id: groupId,
                creator: groupCreator,
                visibility: Visibility.public,
                alias: "hola",
                admins: [users[1]],
                members: users,
                magazines: groupMagazines
            }
            await createGroup(groupRequest, groupModel);
            const userRequest: PersonalAccountTestRequest = {
                _id: users[1],
                groups: [groupId]
            }
            await createPersonalUser(userModel, userRequest)


            let group = await groupModel.findById({ _id: groupId });
            expect(group).not.toBe(null);
            expect(group?.admins.length).toBe(1)

            const groupExitRequest = {
                groupId: groupId.toString(),
                creator: groupCreator.toString(),
            }

            await expect(groupService.exitGroupById(
                groupExitRequest
            )).rejects.toThrow(Error('Invalid Request'));
        })


        it('Exit group being creator and asign new creator and sent a member to, should return an error', async () => {

            const groupRequest: GroupTestRequest = {
                _id: groupId,
                creator: groupCreator,
                visibility: Visibility.public,
                alias: "hola",
                admins: [users[1]],
                members: users,
                magazines: groupMagazines
            }
            await createGroup(groupRequest, groupModel);
            const userRequest: PersonalAccountTestRequest = {
                _id: users[1],
                groups: [groupId]
            }
            await createPersonalUser(userModel, userRequest)


            let group = await groupModel.findById({ _id: groupId });
            expect(group).not.toBe(null);
            expect(group?.admins.length).toBe(1)

            const groupExitRequest = {
                groupId: groupId.toString(),
                creator: groupCreator.toString(),
                member: users[1].toString(),
                newCreator: users[2].toString(),
            }

            await expect(groupService.exitGroupById(
                groupExitRequest
            )).rejects.toThrow(Error('Invalid Request'));
        })

        it('Exit group being creator and asign new creator ', async () => {



            const groupRequest: GroupTestRequest = {
                _id: groupId,
                creator: groupCreator,
                visibility: Visibility.public,
                alias: "hola",
                admins: [users[1]],
                members: users,
                magazines: groupMagazines
            }
            await createGroup(groupRequest, groupModel);
            let userRequest = {
                _id: users[1],
                groups: [groupId]
            }
            await createPersonalUser(userModel, userRequest)
            userRequest._id = groupCreator
            await createPersonalUser(userModel, userRequest)


            let group = await groupModel.findById({ _id: groupId });
            expect(group).not.toBe(null);
            expect(group?.admins.length).toBe(1)
            expect(group?.creator).toEqual(groupCreator)

            const groupExitRequest = {
                groupId: groupId.toString(),
                creator: groupCreator.toString(),
                newCreator: users[1].toString(),
            }

            await groupService.exitGroupById(
                groupExitRequest)

            group = await groupModel.findById({ _id: groupId });
            expect(group).not.toBe(null);
            expect(group?.admins.length).toBe(0)
            expect(group?.creator.toString()).toEqual(groupExitRequest.newCreator)

            const user: any = await userModel.findById(groupExitRequest.creator)
            expect(user).not.toBe(null);
            expect(user.groups.length).toBe(0)

            const userNewCreator: any = await userModel.findOne({ _id: groupExitRequest.newCreator })
            expect(userNewCreator).not.toBe(null);
            expect(userNewCreator.groups.length).toBe(1)

        })
    })


    describe('Group invitations test should put user in group member array and pull invitation from groupNotificationsRequest and userIdAndNotificationMap', () => {
        const userInvited = users[2]
        const groupRequest: GroupTestRequest = {
            _id: groupId,
            creator: groupCreator,
            visibility: Visibility.public,
            alias: "hola",
            admins: [users[1]],
            members: [users[3]],
            groupNotificationsRequest: {
                joinRequests: [userInvited],
                groupInvitations: [],
            },
            userIdAndNotificationMap: new Map<string, string>(
                [
                    [userInvited.toString(), "67c326997c2ebf6094687b1e"],
                ]
            ),
        }
        beforeAll(async () => {
            jest.spyOn(groupRepository, 'setNotificationActionsInFalse').mockImplementation(() => { return Promise.resolve() })
        })

        it('Acept GROUP INVITATION, ', async () => {
            const notificationId = new Types.ObjectId("67c326997c2ebf6094687b1e")
            const userInvited = users[2]
            const userRequest: PersonalAccountTestRequest = {
                _id: userInvited,
                groups: [],
            }
            await createPersonalUser(userModel, userRequest)
            await notificationModel.create({
                _id: notificationId,
                event: "notification_group_new_user_invited",
                viewed: false,
                date: "2025-03-01T15:24:08.925+00:00",
                user: "67164bd032f3b18ed706efb4",
                isActionsAvailable: true,
                backData: {
                    userIdTo: "67164bd032f3b18ed706efb4",
                    userIdFrom: userInvited,
                },
                socketJobId: "d11fd3ca-94a0-4dfe-b659-c72f2d49d5f0",
                type: "group_notifications",
                notificationEntityId: "notification_group_new_user_invited67420686b02bdd1f9f0ef44667164bd032f..",
                previousNotificationId: null,
                kind: "NotificationGroup",
                frontData: {
                    group: {
                        _id: "67c326987c2ebf6094687b18",
                        name: "test group invitation",
                        profilePhotoUrl: ""
                    },
                    userInviting: {
                        _id: "67420686b02bdd1f9f0ef446",
                        username: "maximan"
                    }
                }
            })
            const groupRequest: GroupTestRequest = {
                _id: groupId,
                creator: groupCreator,
                visibility: Visibility.public,
                alias: "hola",
                admins: [users[1]],
                members: [users[3]],
                groupNotificationsRequest: {
                    joinRequests: [],
                    groupInvitations: [userInvited],
                },
                userIdAndNotificationMap: new Map<string, string>([[userInvited.toString(), notificationId.toString()]]),
            }

            await groupModel.create(groupRequest)


            let group = await groupModel.findById({ _id: groupId });

            expect(group?.members.length).toBe(1)
            expect(group?.groupNotificationsRequest.joinRequests.length).toBe(0)
            expect(group?.groupNotificationsRequest.groupInvitations.length).toBe(1)



            await groupService.acceptGroupInvitation(
                groupRequest._id.toString(),
                userInvited.toString(),
            )

            group = await groupModel.findById({ _id: groupId });

            expect(group?.members.length).toBe(2)
            expect(group?.groupNotificationsRequest.joinRequests.length).toBe(0)
            expect(group?.groupNotificationsRequest.groupInvitations.length).toBe(0)


            const user = await userModel.findById(userInvited)
            expect(user?.groups[0]).toEqual(groupRequest._id)





        })

        it('Acept JOIN INVITATION being member, should return permission denied', async () => {

            await createGroup(groupRequest, groupModel)
            let group = await groupModel.findById({ _id: groupId });

            expect(group?.members.length).toBe(1)
            expect(group?.groupNotificationsRequest.joinRequests.length).toBe(1)
            expect(group?.groupNotificationsRequest.groupInvitations.length).toBe(0)



            await expect(groupService.acceptJoinGroupRequest(
                userInvited.toString(),
                groupRequest._id.toString(),
                groupRequest.members![0].toString(),
            )).rejects.toThrow(UnauthorizedException)

            group = await groupModel.findById({ _id: groupId });

            expect(group?.members.length).toBe(1)
            expect(group?.groupNotificationsRequest.joinRequests.length).toBe(1)
            expect(group?.groupNotificationsRequest.groupInvitations.length).toBe(0)


            const user = await userModel.findById(userInvited)
            expect(user?.groups[0]).not.toEqual(groupRequest._id)



        })



        it('Acept JOIN INVITATION being creator, should return work success', async () => {
            await createGroup(groupRequest, groupModel)

            await createPersonalUser(userModel, { _id: userInvited })
            let group = await groupModel.findById({ _id: groupId });
            expect(group?.members.length).toBe(1)
            expect(group?.groupNotificationsRequest.joinRequests.length).toBe(1)
            expect(group?.groupNotificationsRequest.groupInvitations.length).toBe(0)



            await groupService.acceptJoinGroupRequest(
                userInvited.toString(),
                groupRequest._id.toString(),
                groupCreator.toString(),
            )

            group = await groupModel.findById({ _id: groupId });

            expect(group?.members.length).toBe(2)
            expect(group?.groupNotificationsRequest.joinRequests.length).toBe(0)
            expect(group?.groupNotificationsRequest.groupInvitations.length).toBe(0)


            const user = await userModel.findById(userInvited)
            expect(user?.groups[0]).toEqual(groupRequest._id)

        })

        it('Acept JOIN INVITATION being admin, should return work success', async () => {
            await createGroup(groupRequest, groupModel)
            await createPersonalUser(userModel, { _id: userInvited })
            let group = await groupModel.findById({ _id: groupId });

            expect(group?.members.length).toBe(1)
            expect(group?.groupNotificationsRequest.joinRequests.length).toBe(1)
            expect(group?.groupNotificationsRequest.groupInvitations.length).toBe(0)



            await groupService.acceptJoinGroupRequest(
                userInvited.toString(),
                groupRequest._id.toString(),
                groupRequest.admins![0].toString(),
            )

            group = await groupModel.findById({ _id: groupId });

            expect(group?.members.length).toBe(2)
            expect(group?.groupNotificationsRequest.joinRequests.length).toBe(0)
            expect(group?.groupNotificationsRequest.groupInvitations.length).toBe(0)


            const user = await userModel.findById(userInvited)
            expect(user?.groups[0]).toEqual(groupRequest._id)

        })


    })

    describe('Remove members of the group', () => {
        const userToRemove = users[2]
        const groupRequest: GroupTestRequest = {
            _id: groupId,
            creator: groupCreator,
            visibility: Visibility.public,
            alias: "hola",
            admins: [users[1]],
            members: [userToRemove, users[0]],
        }
        beforeEach(async () => {
            await createGroup(groupRequest, groupModel)
            await createPersonalUser(userModel, { _id: userToRemove, groups: [groupRequest._id] })
        })


        it('Remove Member being Member, should return permission denied', async () => {

            await expect(groupService.deleteMembersFromGroup(
                [userToRemove.toString()],
                groupRequest._id.toString(),
                groupRequest.members![0].toString(),
            )).rejects.toThrow(UnauthorizedException)


            const group = await groupModel.findById({ _id: groupId })
            expect(group?.members.length).toBe(2)

            const user = await userModel.findById(userToRemove)
            expect(user?.groups[0]).toEqual(groupRequest._id)



        })

        it('Remove Member being Admin, should return work success', async () => {
            await groupService.deleteMembersFromGroup(
                [userToRemove.toString()],
                groupRequest._id.toString(),
                groupRequest.admins![0].toString(),
            )

            const group = await groupModel.findById({ _id: groupId })
            expect(group?.members.length).toBe(1)

            const user = await userModel.findById(userToRemove)
            expect(user?.groups[0]).not.toEqual(groupRequest._id)

        })

        it('Remove Member being Creator, should return work success', async () => {
            await groupService.deleteMembersFromGroup(
                [userToRemove.toString()],
                groupRequest._id.toString(),
                groupRequest.creator.toString(),
            )

            const group = await groupModel.findById({ _id: groupId })
            expect(group?.members.length).toBe(1)

            const user = await userModel.findById(userToRemove)
            expect(user?.groups[0]).not.toEqual(groupRequest._id)

        })




    })









})


