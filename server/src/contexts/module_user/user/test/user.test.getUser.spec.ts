import mongoose, { Model, Connection, Types } from "mongoose";
import { TestingModule } from "@nestjs/testing";
import { getModelToken } from '@nestjs/mongoose';


import mapModuleTesting from "./user.test.module";
import { UserService } from "../application/service/user.service";
import { IUser, UserModel } from '../infrastructure/schemas/user.schema';
import { UserRelationDocument, UserRelationModel } from "../infrastructure/schemas/user.relation.schema";
import { createPersonalUser } from "../../../../../test/functions/create.user";
import PostModel, { PostDocument } from "src/contexts/module_post/post/infraestructure/schemas/post.schema";
import { createPostGood } from "../../../../../test/functions/create.post";
import { createSection, createUserMagazine } from "../../../../../test/functions/create.magazine";
import { MagazineDocument, MagazineModel } from "src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.schema";
import { MagazineSectionDocument, MagazineSectionModel } from "src/contexts/module_magazine/magazine/infrastructure/schemas/section/magazine.section.schema";


describe('UserService - Make relation between two users', () => {
    let connection: Connection;
    let userService: UserService;
    let userRelationModel: Model<UserRelationDocument>
    let userModel: Model<IUser>;
    let postModel: Model<PostDocument>
    let magazineModel: Model<MagazineDocument>
    let magazineSectionModel: Model<MagazineSectionDocument>

    const userProfileId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7c");
    const userRequestId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7b");
    const userRelationId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7a");
    const postId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7d");
    const magazineId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7f");
    const sectionId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7e");


    jest.setTimeout(10000);
    beforeAll(async () => {
        const moduleRef: TestingModule = await mapModuleTesting.get("make-relation")();
        userService = moduleRef.get<UserService>('UserServiceInterface');
        connection = mongoose.connection;
        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        userRelationModel = moduleRef.get<Model<UserRelationDocument>>(getModelToken(UserRelationModel.modelName));
        postModel = moduleRef.get<Model<PostDocument>>(getModelToken(PostModel.modelName));
        magazineModel = moduleRef.get<Model<MagazineDocument>>(getModelToken(MagazineModel.modelName));
        magazineSectionModel = moduleRef.get<Model<MagazineSectionDocument>>(getModelToken(MagazineSectionModel.modelName));
        const userRelation = new Map([["userRelations", userRelationId]])
        await createPersonalUser(userModel, { _id: userProfileId, userRelations: userRelation, magazines: [magazineId], posts: [postId] });



    });

    afterAll(async () => {
        await userModel.deleteMany({});

        await connection.close();

    })
    afterEach(async () => {
        await magazineModel.deleteMany({});
        await userRelationModel.deleteMany({});
        await postModel.deleteMany({});
        await magazineSectionModel.deleteMany({});
    })

    it('GET profile by external user -Should return PostArray and MagazineArray length 1 RelationShip -> friends & Post visibility -> friends Magazine visibility -> friends', async () => {
        await createPostGood(postId, postModel, userProfileId.toString(), "friends")
        await createSection(sectionId, magazineSectionModel, [postId], true)
        await createUserMagazine(magazineId, magazineModel, userProfileId, [sectionId], "friends");
        userRelationModel.create({
            _id: userRelationId,
            userA: userProfileId,
            userB: userRequestId,
            typeRelationA: "friends",
            typeRelationB: "friends",
        })

        const user = await userService.findProfileUserByExternalUserById(userProfileId.toString());
        console.log(user)
        expect(user.posts.length).toBe(1);
        expect(user.magazines[0].sections[0].posts.length).toBe(1);
        expect(user.magazines[0].sections[0].posts[0]._id).toEqual(postId);
        expect(user.posts[0]._id).toEqual(postId);


    });


    it('GET profile by external user -Should return PostArray and MagazineArray length 1 relationShip -> friends & Post visibility -> contacts Magazine visibility -> contacts ', async () => {
        await createPostGood(postId, postModel, userProfileId.toString(), "contacts")
        await createSection(sectionId, magazineSectionModel, [postId], true)
        await createUserMagazine(magazineId, magazineModel, userProfileId, [sectionId], "contacts");

        userRelationModel.create({
            _id: userRelationId,
            userA: userProfileId,
            userB: userRequestId,
            typeRelationA: "friends",
            typeRelationB: "friends",
        })

        const user = await userService.findProfileUserByExternalUserById(userProfileId.toString());
        expect(user.posts.length).toBe(1);
        expect(user.magazines[0].sections[0].posts.length).toBe(1);
        expect(user.magazines[0].sections[0].posts[0]._id).toEqual(postId);
        expect(user.posts[0]._id).toEqual(postId);
    });

    it('GET profile by external user -Should return PostArray and MagazineArray length 1 relationShip -> topfriends & Post visibility -> contacts Magazine visibility -> friends ', async () => {
        await createPostGood(postId, postModel, userProfileId.toString(), "contacts")
        await createSection(sectionId, magazineSectionModel, [postId], true)
        await createUserMagazine(magazineId, magazineModel, userProfileId, [sectionId], "friends");
        userRelationModel.create({
            _id: userRelationId,
            userA: userProfileId,
            userB: userRequestId,
            typeRelationA: "topfriends",
            typeRelationB: "topfriends",
        })

        const user = await userService.findProfileUserByExternalUserById(userProfileId.toString());
        expect(user.posts.length).toBe(1);
        expect(user.magazines[0].sections[0].posts.length).toBe(1);
        expect(user.magazines[0].sections[0].posts[0]._id).toEqual(postId);
        expect(user.posts[0]._id).toEqual(postId);
    });


    it('GET profile by external user -Should return PostArray and MagazineArray length 1 relationShip -> topfriends & Post visibility -> friends Magazine visibility -> topfriends ', async () => {
        await createPostGood(postId, postModel, userProfileId.toString(), "friends")
        await createSection(sectionId, magazineSectionModel, [postId], true)
        await createUserMagazine(magazineId, magazineModel, userProfileId, [sectionId], "topfriends");
        userRelationModel.create({
            _id: userRelationId,
            userA: userProfileId,
            userB: userRequestId,
            typeRelationA: "topfriends",
            typeRelationB: "topfriends",
        })

        const user = await userService.findProfileUserByExternalUserById(userProfileId.toString());
        expect(user.posts.length).toBe(1);
        expect(user.magazines[0].sections[0].posts.length).toBe(1);
        expect(user.magazines[0].sections[0].posts[0]._id).toEqual(postId);
        expect(user.posts[0]._id).toEqual(postId);
    });

    it('GET profile by external user -Should return PostArray and MagazineArray length 1 relationShip -> topfriends & Post visibility -> topfriends Magazine visibility -> topfriends ', async () => {
        await createPostGood(postId, postModel, userProfileId.toString(), "topfriends")
        await createSection(sectionId, magazineSectionModel, [postId], true)
        await createUserMagazine(magazineId, magazineModel, userProfileId, [sectionId], "topfriends");
        userRelationModel.create({
            _id: userRelationId,
            userA: userProfileId,
            userB: userRequestId,
            typeRelationA: "topfriends",
            typeRelationB: "topfriends",
        })

        const user = await userService.findProfileUserByExternalUserById(userProfileId.toString());
        expect(user.posts.length).toBe(1);
        expect(user.magazines[0].sections[0].posts.length).toBe(1);
        expect(user.magazines[0].sections[0].posts[0]._id).toEqual(postId);
        expect(user.posts[0]._id).toEqual(postId);
    });



    it('GET profile by external user -Should return PostArray and MagazineArray length 0 relationShip -> contacts & Post visibility -> friends Magazine visibility -> topfriends', async () => {
        await createPostGood(postId, postModel, userProfileId.toString(), "friends")
        await createSection(sectionId, magazineSectionModel, [postId], true)
        await createUserMagazine(magazineId, magazineModel, userProfileId, [sectionId], "topfriends");
        userRelationModel.create({
            _id: userRelationId,
            userA: userProfileId,
            userB: userRequestId,
            typeRelationA: "contacts",
            typeRelationB: "contacts",
        })
        const user = await userService.findProfileUserByExternalUserById(userProfileId.toString());
        expect(user.posts.length).toBe(0);
        expect(user.magazines).toEqual([]);

    });


    it('GET profile by external user -Should return PostArray and MagazineArray length 0 relationShip -> friends & Post visibility -> topfriends Magazine visibility -> topfriends', async () => {
        await createPostGood(postId, postModel, userProfileId.toString(), "topfriends")
        await createSection(sectionId, magazineSectionModel, [postId], true)
        await createUserMagazine(magazineId, magazineModel, userProfileId, [sectionId], "topfriends");
        userRelationModel.create({
            _id: userRelationId,
            userA: userProfileId,
            userB: userRequestId,
            typeRelationA: "friends",
            typeRelationB: "friends",
        })
        const user = await userService.findProfileUserByExternalUserById(userProfileId.toString());
        expect(user.posts.length).toBe(0);
        expect(user.magazines).toEqual([]);
    });




})



