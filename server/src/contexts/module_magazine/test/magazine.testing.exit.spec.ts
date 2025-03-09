import { TestingModule } from "@nestjs/testing";
import mongoose, { Connection, Model, Types } from "mongoose";
import { getModelToken } from "@nestjs/mongoose";


import { MagazineService } from "../magazine/application/service/magazine.service";
import { GroupMagazineDocument, GroupMagazineModel } from "../magazine/infrastructure/schemas/magazine.group.schema";
import mapModuleTesting from "./magazine.test.module";
import { UserMagazineDocument, UserMagazineModel } from "../magazine/infrastructure/schemas/magazine.user.schema";
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { insertUserMagazine } from "./models/db/insert.group.magazine";
import { createPersonalUser } from "../../../../test/functions/create.user";


describe('Magazine Service Testing - Exit Magazine', () => {
    let connection: Connection;

    let magazineService: MagazineService;
    let groupMagazineModel: Model<GroupMagazineDocument>
    let userMagazineModel: Model<UserMagazineDocument>
    let userModel: Model<IUser>

    const creatorOfMagazine = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7f");
    const magazineId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7e");
    const collaborators = [
        new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7c"),
        new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7d"),
    ]


    beforeAll(async () => {
        const moduleRef: TestingModule = await mapModuleTesting.get("magazine")();
        connection = mongoose.connection;

        groupMagazineModel = moduleRef.get<Model<GroupMagazineDocument>>(getModelToken(GroupMagazineModel.modelName));
        userMagazineModel = moduleRef.get<Model<UserMagazineDocument>>(getModelToken(UserMagazineModel.modelName));
        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));

        magazineService = moduleRef.get<MagazineService>('MagazineServiceInterface');
    });

    afterAll(async () => {
        await connection.close();
    });

    afterEach(async () => {
        await groupMagazineModel.deleteMany({});
        await userMagazineModel.deleteMany({});
        await userModel.deleteMany({});
    });


    describe('Magazine Service Testing - Sections & Post', () => {

        it('USER Magazine-> type of user : Collaborator of Magazine - Exit Magazine, should return work success', async () => {
            await createPersonalUser(userModel, {
                _id: collaborators[0],
                magazines: [magazineId],
            })


            await insertUserMagazine(userMagazineModel, {
                _id: magazineId,
                user: creatorOfMagazine,
                collaborators: collaborators,
            })


            await magazineService.exitMagazineByMagazineId(
                magazineId.toString(),
                collaborators[0].toString(),
                "user",
            )


            const userMagazine = await userMagazineModel.findById(magazineId)

            expect(userMagazine).toBeDefined();
            expect(userMagazine!.collaborators.length).toBe(1);
            expect(userMagazine!.collaborators[0]).toEqual(collaborators[1]);


            const user: any = await userModel.findById(collaborators[0])
            expect(user).toBeDefined();
            expect(user.magazines.length).toBe(0);



        })

        it('GROUP Magazine-> type of user : Collaborator of Magazine - Exit Magazine, should return work success', async () => {
            await createPersonalUser(userModel, {
                _id: collaborators[1],
                magazines: [magazineId],
            })


            await insertUserMagazine(userMagazineModel, {
                _id: magazineId,
                user: creatorOfMagazine,
                collaborators: collaborators,
            })


            await magazineService.exitMagazineByMagazineId(
                magazineId.toString(),
                collaborators[1].toString(),
                "user",
            )


            const userMagazine = await userMagazineModel.findById(magazineId)

            expect(userMagazine).toBeDefined();
            expect(userMagazine!.collaborators.length).toBe(1);
            expect(userMagazine!.collaborators[0]).toEqual(collaborators[0]);


            const user: any = await userModel.findById(collaborators[1])
            expect(user).toBeDefined();
            expect(user.magazines.length).toBe(0);



        })
    })




})

