import { Model, Types, Connection, ClientSession } from "mongoose"
import { getModelToken } from "@nestjs/mongoose"
import { TestingModule } from "@nestjs/testing"



import { createGroup, GroupTestRequest } from "../../../../test/functions_unit_testing/user/create.group";
import { GroupListResponse } from "../group/application/adapter/dto/HTTP-RESPONSE/group.response"
import { createPersonalUser } from "../../../../test/functions_unit_testing/user/create.user"
import { Visibility } from "../group/domain/entity/enum/group.visibility.enum"
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema"
import { GroupService } from "../group/application/service/group.service"
import { GroupDocument } from "../group/infrastructure/schemas/group.schema"
import mapModuleTesting from "./group.test.module"

describe('GROUP TEST SERVICE FINDS ', () => {
    let groupModel: Model<GroupDocument>
    let userModel: Model<IUser>

    let groupService: GroupService;
    let connection: Connection;
    let sessionMock: Partial<ClientSession>;

    const groupId = new Types.ObjectId("66c49508e80306e90ec637d8");
    const groupCreator = new Types.ObjectId("66c39528e80296e90ec637d8");
    const users = [
        new Types.ObjectId("66c5a1b0e80296e90ec638a1"),
        new Types.ObjectId("66c5a1b0e80296e90ec638a2"),
        new Types.ObjectId("66c5a1b0e80296e90ec638a3"),
        new Types.ObjectId("66c5a1b0e80296e90ec638a4"),
        new Types.ObjectId("66c5a1b0e80296e90ec638a5"),
        new Types.ObjectId("66c5a1b0e80296e90ec638a6"),
    ];

    const groupRequest: GroupTestRequest = {
        _id: groupId,
        creator: groupCreator,
        visibility: Visibility.public,
        name: "tetetetesting",
        alias: "jejej2312",
        admins: [users[3]],
        members: [users[1]],
        groupNotificationsRequest: { joinRequests: [users[0]], groupInvitations: [users[2]] }
    }




    beforeAll(async () => {
        const moduleRef: TestingModule = await mapModuleTesting.get("group")();
        groupModel = moduleRef.get<Model<GroupDocument>>(getModelToken("Group"));
        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        groupService = moduleRef.get<GroupService>('GroupServiceInterface');

        await createGroup(groupRequest, groupModel)
        await createPersonalUser(userModel, { _id: groupRequest.members![0], groups: [groupRequest._id] })
        await createPersonalUser(userModel, { _id: groupRequest.admins![0], groups: [groupRequest._id] })
        connection = moduleRef.get<Connection>(Connection);


        sessionMock = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn(),
            inTransaction: jest.fn().mockReturnValue(false),  
        };
    })




    describe('Find group by alias/name an return if user request is member, has a join request or a group request', () => {
        afterAll(async () => {
            await groupModel.deleteMany({});
            await userModel.deleteMany({});
        })

        it('Find group by member, should return work success and  isMember in true', async () => {

            const group: GroupListResponse = await groupService.findGroupByNameOrAlias(
                groupRequest.name!,
                10,
                1,
                groupRequest.members![0].toString(),
            )
            console.log(group.groups[0])
            expect(group.groups.length).toBe(1)
            expect(group.groups[0].isMember).toBe(true)
            expect(group.groups[0].hasJoinRequest).toBe(false)
            expect(group.groups[0].hasGroupRequest).toBe(false)

        })

        it('Find group by admin, should return work success and  isMember in true', async () => {

            const group: GroupListResponse = await groupService.findGroupByNameOrAlias(
                groupRequest.name!,
                10,
                1,
                groupRequest.admins![0].toString(),
            )

            expect(group.groups.length).toBe(1)
            expect(group.groups[0].isMember).toBe(true)
            expect(group.groups[0].hasJoinRequest).toBe(false)
            expect(group.groups[0].hasGroupRequest).toBe(false)

        })




        it('Find group by user that has a Join request, should return work success and  hasJoinRequest in true', async () => {

            const group: GroupListResponse = await groupService.findGroupByNameOrAlias(
                groupRequest.name!,
                10,
                1,
                groupRequest.groupNotificationsRequest!.joinRequests[0].toString(),
            )

            expect(group.groups.length).toBe(1)
            expect(group.groups[0].isMember).toBe(false)
            expect(group.groups[0].hasJoinRequest).toBe(true)
            expect(group.groups[0].hasGroupRequest).toBe(false)


        })


        it('Find group by user that has a Group request, should return work success and  hasGroupRequest in true', async () => {

            const group: GroupListResponse = await groupService.findGroupByNameOrAlias(
                groupRequest.name!,
                10,
                1,
                groupRequest.groupNotificationsRequest!.groupInvitations[0].toString(),
            )

            expect(group.groups.length).toBe(1)
            expect(group.groups[0].isMember).toBe(false)
            expect(group.groups[0].hasJoinRequest).toBe(false)
            expect(group.groups[0].hasGroupRequest).toBe(true)


        })

        it('Find group by user that does not is member, admin, has a Join request or has a Group request, should return work success', async () => {
            const group: GroupListResponse = await groupService.findGroupByNameOrAlias(
                groupRequest.name!,
                10,
                1,
                new Types.ObjectId("66c49508e80296e90ec637d7").toString(),
            )
            expect(group.groups.length).toBe(1)
            expect(group.groups[0].isMember).toBe(false)
            expect(group.groups[0].hasJoinRequest).toBe(false)
            expect(group.groups[0].hasGroupRequest).toBe(false)


        })
    })



    



})