import mongoose, { Connection, Model, ObjectId, Types } from "mongoose";
import { TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";

import { MagazineDocument, MagazineModel } from "../magazine/infrastructure/schemas/magazine.schema";
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import mapModuleTesting from "./magazine.test.module";
import { createPersonalUser } from "../../../../test/functions/create.user";

import { MagazineAdapter } from "../magazine/infrastructure/resolver/adapter/magazine.adapter";
import { createGroupMagazine, createUserMagazine } from "./models/create.magazine.request";
import { MagazineCreateRequest } from "../magazine/application/adapter/dto/HTTP-REQUEST/magazine.create.request";
import { GroupDocument } from "src/contexts/module_group/group/infrastructure/schemas/group.schema";

import { MagazineSectionDocument, MagazineSectionModel } from "../magazine/infrastructure/schemas/section/magazine.section.schema";
import { MagazineService } from "../magazine/application/service/magazine.service";
import { MagazineCreateResponse } from "../magazine/application/adapter/dto/HTTP-RESPONSE/magazine.create.response";


describe('Magazine Testing', () => {
    let connection: Connection;
    let magazineModel: Model<MagazineDocument>
    let userModel: Model<IUser>;
    let groupModel: Model<GroupDocument>
    let magazineSection: Model<MagazineSectionDocument>

    let magazineService: MagazineService;
    let magazineAdapter: MagazineAdapter;
    let magazineUserRequest: MagazineCreateRequest;
    let magazineGroupRequest: MagazineCreateRequest;
    const user_id = new Types.ObjectId("66c49508e80296e90ec637d7");
    const subscription_plan_id = new Types.ObjectId("66c49508e80296e90ec637d9");
    const group =
    {
        _id: new Types.ObjectId("66c49508e80296e90ec637d8"),
        // members: [],
        // creator: ,
        // admins: [],
        name: "testing group",
        alias: "testing",
        rules: "no rules",
        magazines: [],
        details: "detalles",
        profilePhotoUrl: "photo url",
        visibility: "public",
        groupNotificationsRequest: {
            joinRequests: [],
            groupInvitations: [],
        },


    }



    beforeAll(async () => {
        const moduleRef: TestingModule = await mapModuleTesting.get("magazine")();
        connection = mongoose.connection;
        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        magazineModel = moduleRef.get<Model<MagazineDocument>>(getModelToken(MagazineModel.modelName));
        groupModel = moduleRef.get<Model<GroupDocument>>(getModelToken("Group"));
        magazineSection = moduleRef.get<Model<MagazineSectionDocument>>(getModelToken(MagazineSectionModel.modelName));

        magazineAdapter = moduleRef.get<MagazineAdapter>('MagazineAdapterInterface');
        magazineService = moduleRef.get<MagazineService>('MagazineServiceInterface');
        const subscription = new Map([["subscriptions", subscription_plan_id]])

        await createPersonalUser(userModel, { _id: user_id, subscriptions: subscription });
        await groupModel.create(group);
        magazineUserRequest = createUserMagazine(user_id);
        magazineGroupRequest = createGroupMagazine(group._id);
        jest.setTimeout(20000);
    });

    afterAll(async () => {
        await connection.close();

    });

    afterEach(async () => {
        await userModel.deleteMany({});
        await magazineModel.deleteMany({});


    });


    describe('CREATE', () => {

        it('Create new USER magazine and return MagazineCreateResponse', async () => {
            magazineUserRequest.addedPost = new Types.ObjectId("66c49508e80296e90ec637d8") as unknown as ObjectId;

            const magazineCreated: MagazineCreateResponse = await magazineAdapter.createMagazine(magazineUserRequest, user_id.toString());

            expect(magazineCreated._id).toBeDefined();
            expect(magazineCreated.name).toBe(magazineUserRequest.name);
            expect(magazineCreated.sections.length).toBe(1);
            expect(magazineCreated.sections[0]._id).toBeDefined();
            expect(magazineCreated.sections[0].isFatherSection).toBe(true);
            expect(magazineCreated.sections[0].posts).toEqual([magazineUserRequest.addedPost]);
            expect(magazineCreated.sections[0].title).toBe("");

        })



        it('Create new GROUP magazine and return MagazineCreateResponse', async () => {
            magazineGroupRequest.addedPost = new Types.ObjectId("66c49508e80296e90ec637d8") as unknown as ObjectId;

            const magazineCreated: MagazineCreateResponse = await magazineAdapter.createMagazine(magazineGroupRequest, user_id.toString());

            expect(magazineCreated._id).toBeDefined();
            expect(magazineCreated.name).toBe(magazineGroupRequest.name);
            expect(magazineCreated.sections.length).toBe(1);
            expect(magazineCreated.sections[0]._id).toBeDefined();
            expect(magazineCreated.sections[0].isFatherSection).toBe(true);
            expect(magazineCreated.sections[0].posts).toEqual([magazineGroupRequest.addedPost]);
            expect(magazineCreated.sections[0].title).toBe("");

        })
    })






});