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


    afterAll(async () => {
        await userModel.deleteMany({});
        await groupModel.deleteMany({});
    })



    it('Create group with unique alias', async () => {
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
        const groupSaved = await groupModel.findOneAndDelete({ alias: "test_alias" });

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

})