import mongoose, { Connection, Model, Types } from "mongoose";
import { IUser } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { MagazineService } from "../magazine/application/service/magazine.service";
import { GroupMagazineDocument, GroupMagazineModel } from "../magazine/infrastructure/schemas/magazine.group.schema";
import { UserMagazineDocument, UserMagazineModel } from "../magazine/infrastructure/schemas/magazine.user.schema";
import { insertGroupMagazine, insertSection, insertUserMagazine } from "./models/db/insert.group.magazine";
import { getModelToken } from "@nestjs/mongoose";
import { TestingModule } from "@nestjs/testing";
import mapModuleTesting from "./magazine.test.module";
import { createGroup } from "../../../../test/functions_unit_testing/user/create.group";
import { GroupDocument } from "src/contexts/module_group/group/infrastructure/schemas/group.schema";
import { MagazineSectionDocument, MagazineSectionModel } from "../magazine/infrastructure/schemas/section/magazine.section.schema";
import { UnauthorizedException } from "@nestjs/common";

enum OwnerType {
    user = 'user',
    group = 'group',
}

interface MagazineUpdateTestRequest {
    _id: string;
    name?: string;
    ownerType: OwnerType;
    description?: string;
    visibility?: string;
}

describe('Magazine Service Testing - Update Magazine', () => {
    let connection: Connection;

    let magazineService: MagazineService;
    let groupMagazineModel: Model<GroupMagazineDocument>
    let userMagazineModel: Model<UserMagazineDocument>
    let groupModel: Model<GroupDocument>
    let magazineSection: Model<MagazineSectionDocument>

    const groupId = new Types.ObjectId("442c2d5d7b8e4d1e4c2d5d7f");
    const creatorOfMagazine = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7f");
    const magazineId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7e");
    const collaborators = [
        new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7c"),
        new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7d"),
    ]

    beforeAll(async () => {
        const moduleRef: TestingModule = await mapModuleTesting.get("magazine")();
        connection = mongoose.connection;

        magazineSection = moduleRef.get<Model<MagazineSectionDocument>>(getModelToken(MagazineSectionModel.modelName));
        groupMagazineModel = moduleRef.get<Model<GroupMagazineDocument>>(getModelToken(GroupMagazineModel.modelName));
        userMagazineModel = moduleRef.get<Model<UserMagazineDocument>>(getModelToken(UserMagazineModel.modelName));
        groupModel = moduleRef.get<Model<GroupDocument>>(getModelToken("Group"));


        magazineService = moduleRef.get<MagazineService>('MagazineServiceInterface');
    });

    afterAll(async () => {
        await connection.close();
    });

    afterEach(async () => {
        await groupMagazineModel.deleteMany({});
        await userMagazineModel.deleteMany({});
        await groupModel.deleteMany({});
        await magazineSection.deleteMany({});


    });



    describe('Magazine Update Testing - Update Magazine', () => {
        it('USER Magazine-> type of user : Creator of Magazine - Update Magazine, should return work success', async () => {

            const magazineExpected: MagazineUpdateTestRequest = {
                _id: magazineId.toString(),
                name: "test edited 2",
                ownerType: OwnerType.user,
                description: "test edited",
                visibility: "public"
            }

            await insertUserMagazine(userMagazineModel, {
                _id: magazineId,
                user: creatorOfMagazine,
                name: "test",
                sections: [],
                description: "test",
                collaborators,
                visibility: "friends",
            })

            await magazineService.updateMagazineById(magazineExpected, creatorOfMagazine.toString())

            const magazineSaved: any = await userMagazineModel.findById(magazineId)

            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.name).toBe(magazineExpected.name);
            expect(magazineSaved!.description).toBe(magazineExpected.description);
            expect(magazineSaved!.visibility).toBe(magazineExpected.visibility);







        })

        it('USER Magazine-> type of user : Unauthorized User- Update Magazine, should return work success', async () => {
            const unauthorizedUserId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7a");
            const magazineExpected: MagazineUpdateTestRequest = {
                _id: magazineId.toString(),
                name: "test edited 2",
                ownerType: OwnerType.user,
                description: "test edited",
                visibility: "public"
            }

            const magazineCreated = await insertUserMagazine(userMagazineModel, {
                _id: magazineId,
                user: creatorOfMagazine,
                name: "test",
                sections: [],
                description: "test",
                collaborators,
                visibility: "friends",
            })

            await magazineService.updateMagazineById(magazineExpected, unauthorizedUserId.toString())

            const magazineSaved: any = await userMagazineModel.findById(magazineId)

            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.name).toBe(magazineCreated.name);
            expect(magazineSaved!.description).toBe(magazineCreated.description);
            expect(magazineSaved!.visibility).toBe(magazineCreated.visibility);

        })



        it('GROUP Magazine-> type of user : Admin of Group - Update Magazine, should return work success', async () => {

            const group = await createGroup({
                _id: groupId,
                admins: [creatorOfMagazine],
                magazines: [magazineId],
                creator: creatorOfMagazine,
            }, groupModel);



            const magazineExpected: MagazineUpdateTestRequest = {
                _id: magazineId.toString(),
                name: "test edited 2",
                ownerType: OwnerType.group,
                description: "test edited",
            }

            await insertGroupMagazine(groupMagazineModel, {
                _id: magazineId,
                group: groupId,
                sections: [],
                name: "test",
                description: "test",
                allowedCollaborators: [],
            })

            await magazineService.updateMagazineById(magazineExpected, group.admins![0].toString(), groupId.toString())

            const magazineSaved: any = await groupMagazineModel.findById(magazineId)

            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.name).toBe(magazineExpected.name);
            expect(magazineSaved!.description).toBe(magazineExpected.description);




        })


        it('GROUP Magazine-> type of user : Creator of Group - Update Magazine, should return work success', async () => {

            const group = await createGroup({
                _id: groupId,
                admins: [creatorOfMagazine],
                magazines: [magazineId],
                creator: creatorOfMagazine,
            }, groupModel);



            const magazineExpected: MagazineUpdateTestRequest = {
                _id: magazineId.toString(),
                name: "test edited 2",
                ownerType: OwnerType.group,
                description: "test edited",
            }

            await insertGroupMagazine(groupMagazineModel, {
                _id: magazineId,
                group: groupId,
                sections: [],
                name: "test",
                description: "test",
                allowedCollaborators: [],
            })

            await magazineService.updateMagazineById(magazineExpected, group.creator.toString(), groupId.toString())

            const magazineSaved: any = await groupMagazineModel.findById(magazineId)

            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.name).toBe(magazineExpected.name);
            expect(magazineSaved!.description).toBe(magazineExpected.description);




        })


        it('Try to edit a ownerType of Magazine, should return data did not change', async () => {

            const group = await createGroup({
                _id: groupId,
                admins: [creatorOfMagazine],
                magazines: [magazineId],
                creator: creatorOfMagazine,
            }, groupModel);



            const magazineExpected: MagazineUpdateTestRequest = {
                _id: magazineId.toString(),
                ownerType: OwnerType.user,
            }

            const magazineCreated = await insertGroupMagazine(groupMagazineModel, {
                _id: magazineId,
                group: groupId,
                sections: [],
                name: "test",
                description: "test",
                allowedCollaborators: [],
            })

            await magazineService.updateMagazineById(magazineExpected, group.creator.toString(), groupId.toString())

            const magazineSaved: any = await groupMagazineModel.findById(magazineId)

            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.name).toBe(magazineCreated.name);
            expect(magazineSaved!.description).toBe(magazineCreated.description);
            expect(magazineSaved!.ownerType).toBe("group");




        })
    })



    describe('Magazine Update Testing - Update Title of section', () => {
        const sectionId = new mongoose.Types.ObjectId("66c49508e80296e90ec647d8");
        const creatorOfGroup = new mongoose.Types.ObjectId("45c49508e80296e90ec647d9");
        const unauthorizedUserId = new mongoose.Types.ObjectId("46c49508e80296e90ec647d7");
        it('USER Magazine-> type of user : Creator of Magazine - Update Magazine, should return work success', async () => {


            const titleExpected = "test edited"
            await insertSection(
                magazineSection,
                {
                    _id: sectionId,
                    title: "Hola como estas"
                })


            await insertUserMagazine(userMagazineModel, {
                _id: magazineId,
                user: creatorOfMagazine,
                name: "test",
                sections: [sectionId],
                description: "test",
                collaborators,
                visibility: "friends",
            })



            await magazineService.updateTitleOfSectionById(
                sectionId.toString(),
                titleExpected,
                creatorOfMagazine.toString(),
                OwnerType.user,
                magazineId.toString()
            )

            const sectionEdited = await magazineSection.findById(sectionId);

            expect(sectionEdited?.title).toBe(titleExpected);







        })

        it('USER Magazine-> type of user : Collaborator of Magazine - Update Magazine, should return work success', async () => {

            const titleExpected = "test edited"
            await insertSection(
                magazineSection,
                {
                    _id: sectionId,
                    title: "Hola como estas"
                })


            await insertUserMagazine(userMagazineModel, {
                _id: magazineId,
                user: creatorOfMagazine,
                name: "test",
                sections: [sectionId],
                description: "test",
                collaborators,
                visibility: "friends",
            })



            await magazineService.updateTitleOfSectionById(
                sectionId.toString(),
                titleExpected,
                collaborators[0].toString(),
                OwnerType.user,
                magazineId.toString()
            )

            const sectionEdited = await magazineSection.findById(sectionId);

            expect(sectionEdited?.title).toBe(titleExpected);





        })

        it('USER Magazine-> type of user : Unauthorized user - Update Magazine, should return permission denied', async () => {

            const originalSection = await insertSection(
                magazineSection,
                {
                    _id: sectionId,
                    title: "Hola como estas"
                })



            await insertUserMagazine(userMagazineModel, {
                _id: magazineId,
                user: creatorOfMagazine,
                name: "test",
                sections: [sectionId],
                description: "test",
                collaborators,
                visibility: "friends",
            })



            await expect(magazineService.updateTitleOfSectionById(
                sectionId.toString(),
                "testeo",
                unauthorizedUserId.toString(),
                OwnerType.user,
                magazineId.toString()
            )).rejects.toThrow(UnauthorizedException)

            const sectionEdited = await magazineSection.findById(sectionId);

            expect(sectionEdited?.title).toBe(originalSection.title);

        })



        it('GROUP Magazine-> type of user : creator of Group - Update Magazine, should return work success', async () => {

            const titleExpected = "test edited"
            await insertSection(
                magazineSection,
                {
                    _id: sectionId,
                    title: "Hola como estas"
                })

            const group = await createGroup({
                _id: groupId,
                magazines: [magazineId],
                creator: creatorOfGroup,
                alias: "group"
            }, groupModel)

            await insertGroupMagazine(groupMagazineModel, {
                _id: magazineId,
                name: "test",
                sections: [sectionId],
                description: "test",
                allowedCollaborators: collaborators,
                group: groupId
            })



            await magazineService.updateTitleOfSectionById(
                sectionId.toString(),
                titleExpected,
                group.creator.toString(),
                OwnerType.group,
                magazineId.toString()
            )

            const sectionEdited = await magazineSection.findById(sectionId);

            expect(sectionEdited?.title).toBe(titleExpected);





        })

        it('GROUP Magazine-> type of user : Admin of Group - Update Magazine, should return work success', async () => {

            const titleExpected = "test edited"
            await insertSection(
                magazineSection,
                {
                    _id: sectionId,
                    title: "Hola como estas"
                })

            const group = await createGroup({
                _id: groupId,
                magazines: [magazineId],
                creator: creatorOfGroup,
                admins: [collaborators[0]],
                alias: "group"
            }, groupModel)

            await insertGroupMagazine(groupMagazineModel, {
                _id: magazineId,
                name: "test",
                sections: [sectionId],
                description: "test",
                allowedCollaborators: collaborators,
                group: groupId
            })



            await magazineService.updateTitleOfSectionById(
                sectionId.toString(),
                titleExpected,
                group.admins[0].toString(),
                OwnerType.group,
                magazineId.toString()
            )

            const sectionEdited = await magazineSection.findById(sectionId);

            expect(sectionEdited?.title).toBe(titleExpected);





        })

        it('GROUP Magazine-> type of user : member of Group - Update Magazine, should return permission denied', async () => {


            const originalSection = await insertSection(
                magazineSection,
                {
                    _id: sectionId,
                    title: "Hola como estas"
                })

            const group = await createGroup({
                _id: groupId,
                magazines: [magazineId],
                creator: creatorOfGroup,
                members: [collaborators[0]],
                alias: "group"
            }, groupModel)

            await insertGroupMagazine(groupMagazineModel, {
                _id: magazineId,
                name: "test",
                sections: [sectionId],
                description: "test",
                group: groupId
            })



            await expect(magazineService.updateTitleOfSectionById(
                sectionId.toString(),
                "testes",
                group.members[0].toString(),
                OwnerType.group,
                magazineId.toString()
            )).rejects.toThrow(UnauthorizedException)


            const sectionEdited = await magazineSection.findById(sectionId);

            expect(sectionEdited?.title).toBe(originalSection.title);





        })



    })

})
