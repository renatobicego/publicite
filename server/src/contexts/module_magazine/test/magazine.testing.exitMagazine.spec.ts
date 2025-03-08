import { TestingModule } from "@nestjs/testing";
import mongoose, { Connection, Model } from "mongoose";


import { MagazineService } from "../magazine/application/service/magazine.service";
import { GroupMagazineDocument, GroupMagazineModel } from "../magazine/infrastructure/schemas/magazine.group.schema";
import mapModuleTesting from "./magazine.test.module";
import { UserMagazineDocument, UserMagazineModel } from "../magazine/infrastructure/schemas/magazine.user.schema";
import { getModelToken } from "@nestjs/mongoose";
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";


describe('Magazine Service Testing - Exit Magazine', () => {
    let connection: Connection;

    let magazineService: MagazineService;
    let groupMagazineModel: Model<GroupMagazineDocument>
    let userMagazineModel: Model<UserMagazineDocument>
    let userModel: Model<IUser>


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
    });


    describe('Magazine Service Testing - Sections & Post', () => {

        it('USER Magazine-> type of user : Creator of magazine exit Magazine, should return work success', async () => {

            
         })






    })




})

