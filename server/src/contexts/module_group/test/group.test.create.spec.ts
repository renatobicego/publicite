import { TestingModule } from "@nestjs/testing";
import mapModuleTesting from "./group.test.module";
import { getModelToken } from "@nestjs/mongoose";
import { Model, ObjectId, Types } from "mongoose";
import { UnauthorizedException } from "@nestjs/common";


import { GroupDocument } from "../group/infrastructure/schemas/group.schema";
import { GroupService } from "../group/application/service/group.service";
import { createPersonalUser } from "../../../../test/functions/create.user";
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { createGroup } from "../../../../test/functions/create.group";
import { MagazineDocument } from "src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.schema";
import { GroupMagazineDocument } from "src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.group.schema";
import { OwnerType } from "src/contexts/module_magazine/magazine/domain/entity/enum/magazine.ownerType.enum";
import { createGroupMagazine, createSection } from "../../../../test/functions/create.magazine";
import { MagazineSectionDocument } from "src/contexts/module_magazine/magazine/infrastructure/schemas/section/magazine.section.schema";
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



describe('GROUP - Create group service test', () => {
    let groupModel: Model<GroupDocument>
    let userModel: Model<IUser>
    let magazineGroupModel: Model<GroupMagazineDocument>
    let magazineModel: Model<MagazineDocument>
    let sectionModel: Model<MagazineSectionDocument>
    let groupService: GroupService;

    beforeAll(async () => {
        const moduleRef: TestingModule = await mapModuleTesting.get("group")();
        groupModel = moduleRef.get<Model<GroupDocument>>(getModelToken("Group"));
        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        magazineGroupModel = moduleRef.get<Model<GroupMagazineDocument>>(getModelToken("GroupMagazine"));
        magazineModel = moduleRef.get<Model<MagazineDocument>>(getModelToken("Magazine"));
        sectionModel = moduleRef.get<Model<MagazineSectionDocument>>(getModelToken("MagazineSection"));
        groupService = moduleRef.get<GroupService>('GroupServiceInterface');
    })

    afterEach(async () => {
        await userModel.deleteMany({});
        await groupModel.deleteMany({});

        await sectionModel.deleteMany({});;
    })




    it('Create group with unique alias and verify that group is in user array', async () => {
        const userId = new Types.ObjectId("66c49508e80296e90ec637d7");
        await createPersonalUser(userId, userModel, new Map([]));
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
            creator: userId,


        }


        await groupService.saveGroup(groupRequest, userId.toString());
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
        const user = await userModel.findById(userId);
        expect(user?.groups).toContainEqual(groupSaved?._id);

    })


    it('Create group with same alias, should return error', async () => {
        const groupId = new Types.ObjectId("66c49508e80296e90ec637d7");
        const creator = new Types.ObjectId("66c49508e80296e90ec637d7");
        await createGroup(groupModel, "hola", groupId, creator, Visibility.public);
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
            creator: creator,


        }
        await expect(groupService.saveGroup(groupRequest, creator.toString())).rejects.toThrowError(
            new RegExp('duplicate key error')
        );

        const groupSaved = await groupModel.find({ alias: "hola" });
        expect(groupSaved.length).toBe(1);


    })

    it('Create group with alias with space, should create with no space', async () => {

        const creator = new Types.ObjectId("66c49508e80296e90ec637d7");
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


        await groupService.saveGroup(groupRequest, creator.toString());
        const groupSaved = await groupModel.findOne({ name });
        if (!groupSaved) throw new Error('Group not found');
        expect(groupSaved.alias).toBe(aliasWithOutSpaces);



    })

    it('Add admin to group being creator, Should it be in the admin array and remove from members array', async () => {
        const groupId = new Types.ObjectId("66c49508e80296e90ec637d7");
        const creator = new Types.ObjectId("66c49508e80296e90ec637d7");
        const newAdmin = new Types.ObjectId("66c49508e80296e90ec637d2");
        await createGroup(groupModel, "hola", groupId, creator, Visibility.public, [newAdmin]);
        await groupService.addAdminToGroup(newAdmin.toString(), groupId.toString(), creator.toString());




        const group = await groupModel.findOne({ _id: groupId });
        if (!group) throw new Error('Group not found');
        expect(group.members.length).toBe(0);
        expect(group.admins.length).toBe(1);
        expect(group.admins[0].toString()).toEqual(newAdmin.toString());





    })

    it('Add admin to group being admin, Should it be in the admin array and remove from members array', async () => {
        const groupId = new Types.ObjectId("66c49508e80296e90ec637d7");
        const creator = new Types.ObjectId("66c49508e80296e90ec637d7");
        const newAdmin = new Types.ObjectId("66c49508e80296e90ec637d2");
        const groupAdmin = new Types.ObjectId("66c49508e80296e90ec637d3");
        await createGroup(groupModel, "alias_testing", groupId, creator, Visibility.public, [newAdmin], [groupAdmin]);
        await groupService.addAdminToGroup(newAdmin.toString(), groupId.toString(), groupAdmin.toString());


        const group = await groupModel.findOne({ _id: groupId });
        if (!group) throw new Error('Group not found');
        expect(group.members.length).toBe(0);
        expect(group.admins.length).toBe(2);
        expect(group.admins[1].toString()).toEqual(newAdmin.toString());


    })

    it('Add admin being a member, Should return permissions error', async () => {
        const groupId = new Types.ObjectId("66c49508e80296e90ec637d7");
        const creator = new Types.ObjectId("66c49508e80296e90ec637d7");
        const newAdmin = new Types.ObjectId("66c49508e80296e90ec637d2");
        const fakeAdmin = new Types.ObjectId("66c49508e80296e90ec637d3");
        await createGroup(groupModel, "hola", groupId, creator, Visibility.public, [newAdmin]);


        await expect(
            groupService.addAdminToGroup(
                newAdmin.toString(),
                groupId.toString(),
                fakeAdmin.toString()
            )
        ).rejects.toThrow(UnauthorizedException);
        const group = await groupModel.findOne({ _id: groupId });
        if (!group) throw new Error('Group not found');
        expect(group.members.length).toBe(1);
        expect(group.admins.length).toBe(0);
        expect(group.members[0].toString()).toEqual(newAdmin.toString());

    })





    it('Add admin being a member, Should return permissions error', async () => {


    })



    it('Delete group, should delete group of members array and magazine groups and sections of these magazines', async () => {
        const groupId = new Types.ObjectId("66c49508e80296e90ec637d7");
        const groupCreator = new Types.ObjectId("66c49508e80296e90ec637d8");
        const sectionId = new Types.ObjectId("66c49508e80293e90ec637d9");
        const sectionId2 = new Types.ObjectId("66c49508e80294e90ec637d9");
        const magazineId = new Types.ObjectId("66c49508e80294e90ec637d4");

        const users = [
            //members
            new Types.ObjectId("66c49508e80296e90ec637d9"),
            new Types.ObjectId("66c49508e80296e90ec637d1"),
            new Types.ObjectId("66c49508e80296e90ec637d2"),
            //admins
            new Types.ObjectId("66c49508e80296e90ec637d4"),
            new Types.ObjectId("66c49508e80296e90ec637d5"),
            new Types.ObjectId("66c49508e80296e90ec637d6"),
            groupCreator
        ]
        await createGroup(groupModel, "crazy alias", groupId, groupCreator, Visibility.public, users.slice(0, 3), users.slice(3));
        await createSection(sectionId, sectionModel, [], true)
        await createSection(sectionId2, sectionModel, [], false)
        await createGroupMagazine(magazineId, magazineGroupModel, groupId, [sectionId, sectionId2], []);


        for (let i = 0; i < users.length; i++) {
            await createPersonalUser(users[i], userModel, undefined, [], [], [groupId])
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


})