import { getModelToken } from "@nestjs/mongoose";
import { TestingModule } from "@nestjs/testing";
import mongoose, { Connection, Model, Types } from "mongoose";

import { GroupDocument } from "src/contexts/module_group/group/infrastructure/schemas/group.schema";
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { createGroup } from "../../../../test/functions_unit_testing/user/create.group";
import { createPersonalUser } from "../../../../test/functions_unit_testing/user/create.user";
import { MagazineService } from "../magazine/application/service/magazine.service";

import { MagazineDocument, MagazineModel } from "../magazine/infrastructure/schemas/magazine.schema";
import { MagazineSectionDocument, MagazineSectionModel } from "../magazine/infrastructure/schemas/section/magazine.section.schema";
import mapModuleTesting from "./magazine.test.module";
import { insertSection, insertGroupMagazine } from "./models/db/insert.group.magazine";
import { GroupMagazine } from "../magazine/domain/entity/group.magazine";
import { GroupMagazineDocument, GroupMagazineModel } from "../magazine/infrastructure/schemas/magazine.group.schema";

describe('Magazine Testing', () => {

    let connection: Connection;
    let magazineGroupModel: Model<GroupMagazineDocument>
    let userModel: Model<IUser>;
    let groupModel: Model<GroupDocument>
    let magazineSection: Model<MagazineSectionDocument>

    let magazineService: MagazineService;

    const groupId = new Types.ObjectId("66c49508e80296e90ec637d3");
    const magazineId = new Types.ObjectId("66c49508e80296e90ec637d9");
    const sectionId = new Types.ObjectId("66c49508e80296e90ec647d8");
    const creatorOfGroup = new Types.ObjectId("45c49508e80296e90ec647d9");
    const users = [
        creatorOfGroup,
        new Types.ObjectId("66c49508e80296e92ec647d9")
    ]




    beforeAll(async () => {
        connection = mongoose.connection;
        const moduleRef: TestingModule = await mapModuleTesting.get("magazine")();
        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        magazineGroupModel = moduleRef.get<Model<GroupMagazineDocument>>(getModelToken(GroupMagazineModel.modelName));
        groupModel = moduleRef.get<Model<GroupDocument>>(getModelToken("Group"));
        magazineSection = moduleRef.get<Model<MagazineSectionDocument>>(getModelToken(MagazineSectionModel.modelName));


        magazineService = moduleRef.get<MagazineService>('MagazineServiceInterface');



    })


    afterAll(async () => {
        await connection.close();

    });

    afterEach(async () => {
        await userModel.deleteMany({});
        await groupModel.deleteMany({});
        await magazineGroupModel.deleteMany({});
        await magazineSection.deleteMany({});

    });


    it('GROUP MAGAZINE -> delete magazine being creator of group, should return work success ', async () => {

        await createGroup({
            _id: groupId,
            magazines: [magazineId],
            creator: creatorOfGroup,
            admins: [users[1]],
            alias: "group"
        }, groupModel)


        for (let i = 0; i < 2; i++) {
            await createPersonalUser(
                userModel,
                {
                    _id: users[i],
                    magazines: [magazineId],
                    userType: "person"
                });
        }


        await insertSection(
            magazineSection,
            {
                _id: sectionId
            })

        await insertGroupMagazine(
            magazineGroupModel,
            {
                _id: magazineId,
                group: groupId,
                sections: [sectionId]
            }
        )


        await magazineService.deleteMagazineByMagazineId(
            magazineId.toString(),
            creatorOfGroup.toString(),
            "group"
        )



        const magazine = await magazineGroupModel.findById(magazineId);
        expect(magazine).toBeNull();

        const section = await magazineSection.findById(sectionId);
        expect(section).toBeNull();

        let usersWithMagazine = await userModel.find({ magazines: [magazineId] });
        expect(usersWithMagazine.length).toBe(0);



    })



})