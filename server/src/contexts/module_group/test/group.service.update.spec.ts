import { BadRequestException, NotFoundException } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";
import mapModuleTesting from "./group.test.module";
import { getModelToken } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";


import { createGroup, GroupTestRequest, GroupUpdateRequestTest } from "../../../../test/functions/create.group";
import { GroupDocument } from "../group/infrastructure/schemas/group.schema";
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { GroupService } from "../group/application/service/group.service";
enum Visibility {
    public = 'public',
    private = 'private',
}


describe('Update group', () => {
    const groupId = new Types.ObjectId("66c49508e80296e90ec637d7");
    const groupCreator = new Types.ObjectId("66c49508e80296e90ec637d8");
    let groupModel: Model<GroupDocument>
    let userModel: Model<IUser>
    let groupService: GroupService;

    const users = [
        new Types.ObjectId("66c49508e80296e90ec637d9"),
        new Types.ObjectId("66c49508e80296e90ec637d1"),
        new Types.ObjectId("66c49508e80296e90ec637d2"),
        new Types.ObjectId("66c49508e80296e90ec637d4"),
        new Types.ObjectId("66c49508e80296e90ec637d5"),
        new Types.ObjectId("66c49508e80296e90ec637d6"),
    ]

    const groupRequest: GroupTestRequest = {
        _id: groupId,
        creator: groupCreator,
        visibility: Visibility.public,
        alias: "hola",
        admins: [users[1]],
        members: [users[0]],
    };

    beforeAll(async () => {
        const moduleRef: TestingModule = await mapModuleTesting.get("group")();
        groupModel = moduleRef.get<Model<GroupDocument>>(getModelToken("Group"));
        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        groupService = moduleRef.get<GroupService>('GroupServiceInterface');

        await createGroup(groupRequest, groupModel)

    })

    afterAll(async () => {
        await userModel.deleteMany({});
        await groupModel.deleteMany({});
    })


    it('Update alias in use, should check if this alias already exist and throw error', async () => {
        groupRequest.alias = "hola2";
        groupRequest._id = new Types.ObjectId("67c326987c2ebf6094687b18");
        await createGroup(groupRequest, groupModel);
        const updateRequest: GroupUpdateRequestTest = {
            _id: groupId.toString(),
            alias: "hola2"
        };


        await expect(groupService.updateGroupById(
            updateRequest,
            groupRequest.creator.toString(),
        )).rejects.toThrow(BadRequestException);
    });

    it('Update name, should update the group name', async () => {
        const updateRequest: GroupUpdateRequestTest = {
            _id: groupId.toString(),
            name: "Nuevo nombre del grupo"
        };

        await groupService.updateGroupById(
            updateRequest,
            groupRequest.creator.toString(),
        );
        const updatedGroup = await groupModel.findById(groupId);

        expect(updatedGroup!.name).toBe(updateRequest.name);

    });


    it('Update alias, should update the group alias if it does not exist', async () => {
        const updateRequest: GroupUpdateRequestTest = {
            _id: groupId.toString(),
            alias: "nuevo-alias"
        };

        await groupService.updateGroupById(
            updateRequest,
            groupRequest.creator.toString(),
        );
        const updatedGroup = await groupModel.findById(groupId);
        expect(updatedGroup!.alias).toBe(updateRequest.alias);
    });



    it('Update rules, should update the group rules', async () => {
        const updateRequest: GroupUpdateRequestTest = {
            _id: groupId.toString(),
            rules: "Nuevas reglas del grupo"
        };

        await groupService.updateGroupById(
            updateRequest,
            groupRequest.creator.toString(),
        );

        const updatedGroup = await groupModel.findById(groupId);
        expect(updatedGroup!.rules).toBe(updateRequest.rules);
    });



    it('Update details, should update the group details', async () => {
        const updateRequest: GroupUpdateRequestTest = {
            _id: groupId.toString(),
            details: "Nuevos detalles del grupo"
        };

        await groupService.updateGroupById(
            updateRequest,
            groupRequest.creator.toString(),
        );

        const updatedGroup = await groupModel.findById(groupId);
        expect(updatedGroup!.details).toBe(updateRequest.details);
    });


    it('Update profile photo URL, should update the group profile photo URL', async () => {
        const updateRequest: GroupUpdateRequestTest = {
            _id: groupId.toString(),
            profilePhotoUrl: "https://nueva-url-de-foto.com"
        };

        await groupService.updateGroupById(
            updateRequest,
            groupRequest.admins![0].toString(),
        );
        const updatedGroup = await groupModel.findById(groupId);
        expect(updatedGroup!.profilePhotoUrl).toBe(updateRequest.profilePhotoUrl);
    });

    it('Update visibility, should update the group visibility', async () => {
        const updateRequest: GroupUpdateRequestTest = {
            _id: groupId.toString(),
            visibility: "private"
        };

        await groupService.updateGroupById(
            updateRequest,
            groupRequest.creator.toString(),
        );

        const updatedGroup = await groupModel.findById(groupId);
        expect(updatedGroup!.visibility).toBe(updateRequest.visibility);
    });

    it('Update group note, should update the group note', async () => {
        const updateRequest: GroupUpdateRequestTest = {
            _id: groupId.toString(),
            groupNote: "Nueva nota del grupo"
        };

        await groupService.updateGroupById(
            updateRequest,
            groupRequest.admins![0].toString(),
        );

        const updatedGroup = await groupModel.findById(groupId);
        expect(updatedGroup!.groupNote).toBe(updateRequest.groupNote);
    });


    it('Update non-existent group, should throw NotFoundException', async () => {
        const updateRequest: GroupUpdateRequestTest = {
            _id: new Types.ObjectId().toString(),
            name: "Nuevo nombre"
        };

        const response = await groupService.updateGroupById(
            updateRequest,
            groupRequest.creator.toString(),
        );

        expect(response).toBe(undefined)
    });


    it('Update group without permissions, should throw ForbiddenException', async () => {
        const updateRequest: GroupUpdateRequestTest = {
            _id: groupId.toString(),
            name: "Nuevo nombre"
        };

        const nonCreatorUserId = new Types.ObjectId().toString();
        const response = await groupService.updateGroupById(
            updateRequest,
            nonCreatorUserId,
        );

        expect(response).toBe(undefined)
    });


});
