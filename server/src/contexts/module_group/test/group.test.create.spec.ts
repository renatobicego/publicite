import { TestingModule } from "@nestjs/testing";
import mapModuleTesting from "./group.test.module";
import { GroupDocument } from "../group/infrastructure/schemas/group.schema";
import { getModelToken } from "@nestjs/mongoose";
import { Model, ObjectId, Types } from "mongoose";
import { GroupService } from "../group/application/service/group.service";
import { createPersonalUser } from "../../../../test/functions/create.user";
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { createGroup } from "../../../../test/functions/create.group";
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
    let groupService: GroupService;

    beforeAll(async () => {
        const moduleRef: TestingModule = await mapModuleTesting.get("group")();
        groupModel = moduleRef.get<Model<GroupDocument>>(getModelToken("Group"));
        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        groupService = moduleRef.get<GroupService>('GroupServiceInterface');
    })

    afterEach(async () => {
        await userModel.deleteMany({});
        await groupModel.deleteMany({});
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

    it('Add admin to group, Should it be in the admin array and remove from members array', async () => {
        const groupId = new Types.ObjectId("66c49508e80296e90ec637d7");
        const creator = new Types.ObjectId("66c49508e80296e90ec637d7");
        const newAdmin = new Types.ObjectId("66c49508e80296e90ec637d2");
        await createGroup(groupModel, "hola", groupId, creator, Visibility.public, [newAdmin]);




        await groupService.addAdminToGroup(newAdmin.toString(), groupId.toString(), creator.toString());




    })

    it('Add admin being a member, Should return permissions error', async () => {
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
        expect(group.creator.toString()).toEqual(creator.toString());




    })









})