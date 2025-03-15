import mongoose, { Model, Connection, Types } from "mongoose";
import { TestingModule } from "@nestjs/testing";
import { getModelToken } from '@nestjs/mongoose';


import mapModuleTesting from "./user.test.module";
import { UserService } from "../application/service/user.service";
import { IUser, UserModel } from '../infrastructure/schemas/user.schema';
import { UserRelationDocument, UserRelationModel } from "../infrastructure/schemas/user.relation.schema";
import { createPersonalUser } from "../../../../../test/functions_unit_testing/user/create.user";
import PostModel, { PostDocument } from "src/contexts/module_post/post/infraestructure/schemas/post.schema";
import { insertPostGood } from "../../../../../test/functions_unit_testing/post/create.post";
import { MagazineDocument, MagazineModel } from "src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.schema";
import { MagazineSectionDocument, MagazineSectionModel } from "src/contexts/module_magazine/magazine/infrastructure/schemas/section/magazine.section.schema";
import { insertSection, insertUserMagazine } from "src/contexts/module_magazine/test/models/db/insert.group.magazine";
import { UserMagazineDocument, UserMagazineModel } from "src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.user.schema";


describe('UserService - Make relation between two users', () => {
    let connection: Connection;
    let userService: UserService;
    let userRelationModel: Model<UserRelationDocument>
    let userModel: Model<IUser>;
    let postModel: Model<PostDocument>
    let userMagazineModel: Model<UserMagazineDocument>
    let magazineSectionModel: Model<MagazineSectionDocument>

    const userProfileId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7c");
    const userRequestId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7b");
    const userRelationId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7a");
    const postId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7d");
    const magazineId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7f");
    const sectionId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7e");



    beforeAll(async () => {
        const moduleRef: TestingModule = await mapModuleTesting.get("make-relation")();
        userService = moduleRef.get<UserService>('UserServiceInterface');
        connection = mongoose.connection;
        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        userRelationModel = moduleRef.get<Model<UserRelationDocument>>(getModelToken(UserRelationModel.modelName));
        postModel = moduleRef.get<Model<PostDocument>>(getModelToken(PostModel.modelName));
        userMagazineModel = moduleRef.get<Model<UserMagazineDocument>>(getModelToken(UserMagazineModel.modelName));
        magazineSectionModel = moduleRef.get<Model<MagazineSectionDocument>>(getModelToken(MagazineSectionModel.modelName));
        await createPersonalUser(userModel, { _id: userProfileId, userRelations: [userRelationId], magazines: [magazineId], posts: [postId] });



    });

    afterAll(async () => {
        await userModel.deleteMany({});

        await connection.close();

    })
    afterEach(async () => {
        await userMagazineModel.deleteMany({});
        await userRelationModel.deleteMany({});
        await postModel.deleteMany({});
        await magazineSectionModel.deleteMany({});
    })

    it('GET profile by external user -Should return PostArray and MagazineArray length 1 RelationShip -> friends & Post visibility -> friends Magazine visibility -> friends', async () => {

        await insertPostGood(postModel, { _id: postId, author: userProfileId.toString(), visibility: { post: "friends", socialMedia: "public" } })
        await insertSection(magazineSectionModel, { _id: sectionId, posts: [postId], isFatherSection: true })
        await insertUserMagazine(userMagazineModel, { _id: magazineId, sections: [sectionId], visibility: "friends", user: new Types.ObjectId() });

        await userRelationModel.create({
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
        await insertPostGood(postModel, { _id: postId, author: userProfileId.toString(), visibility: { post: "contacts", socialMedia: "public" } })
        await insertSection(magazineSectionModel, { _id: sectionId, posts: [postId], isFatherSection: true })
        await insertUserMagazine(userMagazineModel, { _id: magazineId, sections: [sectionId], visibility: "contacts", user: new Types.ObjectId() });

        await userRelationModel.create({
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
        await insertPostGood(postModel, { _id: postId, author: userProfileId.toString(), visibility: { post: "contacts", socialMedia: "public" } })
        await insertSection(magazineSectionModel, { _id: sectionId, posts: [postId], isFatherSection: true })
        await insertUserMagazine(userMagazineModel, { _id: magazineId, sections: [sectionId], visibility: "friends", user: new Types.ObjectId() });

        await userRelationModel.create({
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
        await insertPostGood(postModel, { _id: postId, author: userProfileId.toString(), visibility: { post: "friends", socialMedia: "public" } })
        await insertSection(magazineSectionModel, { _id: sectionId, posts: [postId], isFatherSection: true })
        await insertUserMagazine(userMagazineModel, { _id: magazineId, sections: [sectionId], visibility: "topfriends", user: new Types.ObjectId() });
        await userRelationModel.create({
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
        await insertPostGood(postModel, { _id: postId, author: userProfileId.toString(), visibility: { post: "topfriends", socialMedia: "public" } })
        await insertSection(magazineSectionModel, { _id: sectionId, posts: [postId], isFatherSection: true })
        await insertUserMagazine(userMagazineModel, { _id: magazineId, sections: [sectionId], visibility: "topfriends", user: new Types.ObjectId() });
        await userRelationModel.create({
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
        await insertPostGood(postModel, { _id: postId, author: userProfileId.toString(), visibility: { post: "friends", socialMedia: "public" } })
        await insertSection(magazineSectionModel, { _id: sectionId, posts: [postId], isFatherSection: true })
        await insertUserMagazine(userMagazineModel, { _id: magazineId, sections: [sectionId], visibility: "topfriends", user: new Types.ObjectId() });
        await userRelationModel.create({
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
        await insertPostGood(postModel, { _id: postId, author: userProfileId.toString(), visibility: { post: "topfriends", socialMedia: "public" } })
        await insertSection(magazineSectionModel, { _id: sectionId, posts: [postId], isFatherSection: true })
        await insertUserMagazine(userMagazineModel, { _id: magazineId, sections: [sectionId], visibility: "topfriends", user: new Types.ObjectId() });
        await userRelationModel.create({
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



