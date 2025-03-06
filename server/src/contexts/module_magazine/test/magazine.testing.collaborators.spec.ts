import mongoose, { Connection, Model, ObjectId, Types } from "mongoose";
import { TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";


import mapModuleTesting from "./magazine.test.module";
import { GroupDocument } from "src/contexts/module_group/group/infrastructure/schemas/group.schema";
import { insertGroupMagazine, insertSection, insertUserMagazine } from "./models/db/insert.group.magazine";
import { createGroup } from "../../../../test/functions/create.group";
import { MagazineService } from "../magazine/application/service/magazine.service";
import { GroupMagazineDocument, GroupMagazineModel } from "../magazine/infrastructure/schemas/magazine.group.schema";
import { UnauthorizedException } from "@nestjs/common";
import { MagazineSectionDocument, MagazineSectionModel } from "../magazine/infrastructure/schemas/section/magazine.section.schema";
import { UserMagazineDocument } from "../magazine/infrastructure/schemas/magazine.user.schema";

interface SectionRequest {
    title: string,
    isFatherSection: boolean
}

describe('Magazine Service Testing - Add collaborators & Allowd collaborators', () => {
    let connection: Connection;

    let groupMagazineModel: Model<GroupMagazineDocument>
    let magazineSection: Model<MagazineSectionDocument>
    let groupModel: Model<GroupDocument>
    let userMagazineModel: Model<UserMagazineDocument>


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


        magazineService = moduleRef.get<MagazineService>('MagazineServiceInterface');
    });

    afterAll(async () => {
        await connection.close();

    });

    afterEach(async () => {
        await groupModel.deleteMany({});
        await groupMagazineModel.deleteMany({});
        await userMagazineModel.deleteMany({});
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












});