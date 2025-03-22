import mongoose, { Connection, Model, Types } from "mongoose";
import { TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";


import mapModuleTesting from "./magazine.test.module";
import { GroupDocument } from "src/contexts/module_group/group/infrastructure/schemas/group.schema";
import { insertGroupMagazine, insertUserMagazine } from "./models/db/insert.group.magazine";
import { createGroup } from "../../../../test/functions_unit_testing/user/create.group";
import { MagazineService } from "../magazine/application/service/magazine.service";
import { GroupMagazineDocument, GroupMagazineModel } from "../magazine/infrastructure/schemas/magazine.group.schema";
import { UnauthorizedException } from "@nestjs/common";
import { UserMagazineDocument } from "../magazine/infrastructure/schemas/magazine.user.schema";
import { createPersonalUser } from "../../../../test/functions_unit_testing/user/create.user";
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";


describe('Magazine Service Testing - Add collaborators & Allowd collaborators', () => {
    let connection: Connection;

    let groupMagazineModel: Model<GroupMagazineDocument>
    let groupModel: Model<GroupDocument>
    let userMagazineModel: Model<UserMagazineDocument>
    let userModel: Model<IUser>;


    let magazineService: MagazineService;

    const magazineId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7f");
    const groupId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7e");
    const admins = [
        new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7c"),
        new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7d"),
    ]
    const members = [
        new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7a"),
        new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7b"),
    ]




    beforeAll(async () => {
        const moduleRef: TestingModule = await mapModuleTesting.get("magazine")();
        connection = mongoose.connection;

        groupMagazineModel = moduleRef.get<Model<GroupMagazineDocument>>(getModelToken(GroupMagazineModel.modelName));
        userMagazineModel = moduleRef.get<Model<UserMagazineDocument>>(getModelToken("UserMagazine"));
        groupModel = moduleRef.get<Model<GroupDocument>>(getModelToken("Group"));
        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));


        magazineService = moduleRef.get<MagazineService>('MagazineServiceInterface');
    });

    afterAll(async () => {
        await connection.close();


    });

    afterEach(async () => {
        await groupModel.deleteMany({});
        await groupMagazineModel.deleteMany({});
        await userMagazineModel.deleteMany({});
        await userModel.deleteMany({});

    });


    describe('Add Allowed Collaborator in group magazine', () => {
        it('Group Magazine-> type of user : Creator of group - Add new collaborator, should return work success', async () => {
            const newCollaborator = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7b");
            const group = await createGroup({
                _id: groupId,
                admins: [admins[0]],
                magazines: [magazineId],
                creator: admins[1],
            }, groupModel);

            await insertGroupMagazine(
                groupMagazineModel,
                {
                    _id: magazineId,
                    group: groupId,
                    sections: []
                }
            )



            await magazineService.addAllowedCollaboratorsToGroupMagazine(
                [newCollaborator.toString()],
                magazineId.toString(),
                group.creator.toString(),

            )

            const magazineSaved: any = await groupMagazineModel.findById(magazineId)

            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.allowedCollaborators.length).toBe(1);
            expect(magazineSaved!.allowedCollaborators[0]).toEqual(newCollaborator);
        })

        it('Group Magazine-> type of user : Admin of group - Add new collaborator, should return permission denied', async () => {
            const newCollaborator = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7c");
            const group = await createGroup({
                _id: groupId,
                admins: [admins[0]],
                magazines: [magazineId],
                creator: admins[1],
            }, groupModel);

            await insertGroupMagazine(
                groupMagazineModel,
                {
                    _id: magazineId,
                    group: groupId,
                    sections: []
                }
            )



            await expect(magazineService.addAllowedCollaboratorsToGroupMagazine(
                [newCollaborator.toString()],
                magazineId.toString(),
                group.admins[0].toString(),

            )
            ).rejects.toThrow(UnauthorizedException)
            const magazineSaved: any = await groupMagazineModel.findById(magazineId)

            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.allowedCollaborators.length).toBe(0);




        })

        it('Group Magazine-> type of user : Unauthorized User - Add new collaborator, should return permission denied', async () => {
            const newCollaborator = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7c");
            const unauthorizedUserId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7c");


            await createGroup({
                _id: groupId,
                admins: [admins[0]],
                magazines: [magazineId],
                creator: admins[1],
            }, groupModel);

            await insertGroupMagazine(
                groupMagazineModel,
                {
                    _id: magazineId,
                    group: groupId,
                    sections: []
                }
            )



            await expect(magazineService.addAllowedCollaboratorsToGroupMagazine(
                [newCollaborator.toString()],
                magazineId.toString(),
                unauthorizedUserId.toString(),
            )
            ).rejects.toThrow(UnauthorizedException)
            const magazineSaved: any = await groupMagazineModel.findById(magazineId)

            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.allowedCollaborators.length).toBe(0);




        })


    });





    describe('Add Allowed Collaborator in user magazine', () => {
        it('User Magazine-> type of user : Creator of Magazine - Add new Collaborator, should return work success', async () => {
            const newCollaborator = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7c");

            await createPersonalUser(userModel, {
                _id: newCollaborator,
                userType: "person"
            })
            const userMagazine = await insertUserMagazine(
                userMagazineModel,
                {
                    _id: magazineId,
                    user: members[0]
                }
            )



            await magazineService.addCollaboratorsToUserMagazine(
                [newCollaborator.toString()],
                userMagazine._id.toString(),
                userMagazine.user.toString(),
            )

            const magazineSaved: any = await userMagazineModel.findById(magazineId)

            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.collaborators.length).toBe(1);
            expect(magazineSaved!.collaborators[0]).toEqual(newCollaborator);

            const user: any = await userModel.findById(newCollaborator)
            expect(user).toBeDefined();
            expect(user.magazines[0]).toEqual(magazineId);
        })

        it('User Magazine-> type of user : Unknown User - Add new Collaborator, should persmission denied', async () => {
            const newCollaborator = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7c");
            const unauthorizedUserId = new Types.ObjectId("334c2d5d7b8e3d1e4c2d5d7c");

            const userMagazine = await insertUserMagazine(
                userMagazineModel,
                {
                    _id: magazineId,
                    user: members[0]
                }
            )



            await expect(magazineService.addCollaboratorsToUserMagazine(
                [newCollaborator.toString()],
                userMagazine._id.toString(),
                unauthorizedUserId.toString(),
            )).rejects.toThrow(UnauthorizedException)


            const magazineSaved: any = await userMagazineModel.findById(magazineId)
            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.collaborators.length).toBe(0);

        })
    });


    describe('Delete Collaborator in user magazine', () => {
        it('User Magazine-> type of user : Creator of Magazine - delete Collaborator, should return work success', async () => {
            const collaboratorToDelete = new Types.ObjectId("624c2d5d7bce4d1e4c2d5d7c");

            await createPersonalUser(userModel, {
                _id: collaboratorToDelete,
                magazines: [magazineId],
                userType: "person"
            })
            const userMagazine = await insertUserMagazine(
                userMagazineModel,
                {
                    _id: magazineId,
                    user: members[0],
                    collaborators: [collaboratorToDelete]
                }
            )



            await magazineService.deleteCollaboratorsFromMagazine(
                [collaboratorToDelete.toString()],
                userMagazine._id.toString(),
                userMagazine.user.toString(),
            )

            const magazineSaved: any = await userMagazineModel.findById(magazineId)

            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.collaborators.length).toBe(0);


            const user: any = await userModel.findById(collaboratorToDelete)
            expect(user).toBeDefined();
            expect(user.magazines.length).toBe(0);
        })

        it('User Magazine-> type of user : Unknown User - Add new Collaborator, should persmission denied', async () => {
            const collaboratorToDelete = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7c");
            const unauthorizedUserId = new Types.ObjectId("334c2d5d7b8e3d1e4c2d5d7c");

            const userMagazine = await insertUserMagazine(
                userMagazineModel,
                {
                    _id: magazineId,
                    user: members[0],
                    collaborators: [collaboratorToDelete]
                }
            )


            await createPersonalUser(userModel, {
                _id: collaboratorToDelete,
                magazines: [magazineId],
                userType: "person"
            })


            await expect(magazineService.deleteCollaboratorsFromMagazine(
                [collaboratorToDelete.toString()],
                userMagazine._id.toString(),
                unauthorizedUserId.toString(),
            )).rejects.toThrow(UnauthorizedException)


            const magazineSaved: any = await userMagazineModel.findById(magazineId)
            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.collaborators.length).toBe(1);

            const user: any = await userModel.findById(collaboratorToDelete)
            expect(user).toBeDefined();
            expect(user.magazines.length).toBe(1);
            expect(user.magazines[0]).toEqual(magazineId);


        })
    });



    describe('Delete Collaborator in group magazine', () => {

        
        it('Group Magazine-> type of user : Creator of Magazine - delete Collaborator, should return work success', async () => {
            const allowedCollaboratorToDelete = new Types.ObjectId("624c2c5d7bce4d1e4c2d5d7c");
            const creatorOfGroup = members[0]
            await createGroup({
                _id: groupId,
                creator: creatorOfGroup,
                magazines: [magazineId]
            }, groupModel)

            const grupMagazine = await insertGroupMagazine(
                groupMagazineModel,
                {
                    _id: magazineId,
                    allowedCollaborators: [allowedCollaboratorToDelete],
                    group: groupId

                }
            )



            await magazineService.deleteAllowedCollaboratorsFromMagazineGroup(
                [allowedCollaboratorToDelete.toString()],
                grupMagazine._id.toString(),
                creatorOfGroup.toString(),
            )

            const groupMagazineSaved: any = await groupMagazineModel.findById(magazineId)

            expect(groupMagazineSaved).toBeDefined();
            expect(groupMagazineSaved!.allowedCollaborators.length).toBe(0);

        })

        it('Group Magazine-> type of user : Unknown User - delete Collaborator, should persmission denied', async () => {
            const allowedCollaboratorToDelete = new Types.ObjectId("624c2c5d7bce4d1e4c2d5d7c");
            const creatorOfGroup = members[0]
            const unauthorizedUserId = new Types.ObjectId("334c2d5d7b8e3d1e4c2d5d2c");

            await createPersonalUser(userModel, {
                _id: allowedCollaboratorToDelete,
                magazines: [magazineId],
                userType: "person"
            })
            await createGroup({
                _id: groupId,
                creator: creatorOfGroup,
                magazines: [magazineId]
            }, groupModel)

            const grupMagazine = await insertGroupMagazine(
                groupMagazineModel,
                {
                    _id: magazineId,
                    allowedCollaborators: [allowedCollaboratorToDelete],
                    group: groupId

                }
            )



            await expect(magazineService.deleteAllowedCollaboratorsFromMagazineGroup(
                [allowedCollaboratorToDelete.toString()],
                grupMagazine._id.toString(),
                unauthorizedUserId.toString(),
            )).rejects.toThrow(UnauthorizedException)

            const groupMagazineSaved: any = await groupMagazineModel.findById(magazineId)

            expect(groupMagazineSaved).toBeDefined();
            expect(groupMagazineSaved!.allowedCollaborators.length).toBe(1);
            expect(groupMagazineSaved!.allowedCollaborators[0]).toEqual(allowedCollaboratorToDelete);


            const user: any = await userModel.findById(allowedCollaboratorToDelete)
            expect(user).toBeDefined();
            expect(user.magazines.length).toBe(1);
            expect(user.magazines[0]).toEqual(magazineId);


        })





    });

})