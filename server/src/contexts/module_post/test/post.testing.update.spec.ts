import { TestingModule } from "@nestjs/testing";
import mongoose, { Connection, Model, Types } from "mongoose";
import { getModelToken } from "@nestjs/mongoose";

import mapModuleTesting from "./post.test.module";
import { PostService } from "../post/application/service/post.service";
import { IPostGood, PostGoodModel } from "../post/infraestructure/schemas/post-types-schemas/post.good.schema";
import { inserPostService, insertPostComment, insertPostGood, insertPostPetition } from "../../../../test/functions_unit_testing/post/create.post";
import { createPlanOfSubscription, createSubscriptionForUser } from "../../../../test/functions_unit_testing/plans/create.planAndSub";
import { createPersonalUser } from "../../../../test/functions_unit_testing/user/create.user";
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import SubscriptionPlanModel, { SubscriptionPlanDocument } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscriptionPlan.schema";
import SubscriptionModel, { SubscriptionDocument } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscription.schema";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { EmitterService } from "src/contexts/module_shared/event-emmiter/emmiter";
import { PostRepository } from "../post/infraestructure/repository/post.repository";
import { IPostService } from "../post/infraestructure/schemas/post-types-schemas/post.service.schema";
import { IPostPetition } from "../post/infraestructure/schemas/post-types-schemas/post.petition.schema";
import { PostAdapter } from "../post/infraestructure/adapter/post.adapter";
import PostCommentModel, { PostCommentDocument } from "../post/infraestructure/schemas/post.comment.schema";


enum PostBehaviourType {
    libre = 'libre',
    agenda = 'agenda',
}
interface PostUpdateDto {

    title?: string;
    searchTitle?: string;
    description?: string;
    searchDescription?: string;
    visibility?: any;
    price?: number;

    category?: any[];
    attachedFiles?: Array<{
        url: string;
        label: string;
    }>;
    imagesUrls?: string[];
    year?: number;
    brand?: string;
    modelType?: string;
    condition?: string;
    frequencyPrice?: string;
    toPrice?: number;
    petitionType?: string;
    endDate?: Date;
}


describe('Post Service Testing - Update post  ', () => {
    let connection: Connection;
    let postService: PostService;
    let postAdapter: PostAdapter;

    let postCommentModel: Model<PostCommentDocument>;
    let postServiceModel: Model<IPostService>;
    let postGoodModel: Model<IPostGood>;
    let postPetitionModel: Model<IPostPetition>;
    let userModel: Model<IUser>;
    let subscriptionPlanModel: Model<SubscriptionPlanDocument>
    let subscriptionModel: Model<SubscriptionDocument>
    let emitter: EmitterService;
    let postRepository: PostRepository;

    const subscriptionPlanId = new Types.ObjectId("66c49508e80296e90ec637d9");
    const subscriptionPlanId_2 = new Types.ObjectId("66c49508e80296e90ec637d7");
    const subscriptionId = new Types.ObjectId("66c49508e80296e90ec637d8");
    const subscriptionId_2 = new Types.ObjectId("66c49508e80296e90ec637d6");
    const postId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    beforeAll(async () => {
        connection = mongoose.connection;
        const moduleRef: TestingModule = await mapModuleTesting.get("post")();
        emitter = moduleRef.get<EmitterService>(EmitterService);
        postAdapter = moduleRef.get<PostAdapter>('PostAdapterInterface');
        postRepository = moduleRef.get<PostRepository>("PostRepositoryInterface");
        postService = moduleRef.get<PostService>('PostServiceInterface');

        postGoodModel = moduleRef.get<Model<IPostGood>>(getModelToken(PostGoodModel.modelName));
        postServiceModel = moduleRef.get<Model<IPostService>>('PostServiceModel');
        postPetitionModel = moduleRef.get<Model<IPostPetition>>('PostPetitionModel');

        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        subscriptionPlanModel = moduleRef.get<Model<SubscriptionPlanDocument>>(getModelToken(SubscriptionPlanModel.modelName));
        subscriptionModel = moduleRef.get<Model<SubscriptionDocument>>(getModelToken(SubscriptionModel.modelName));
        postCommentModel = moduleRef.get<Model<PostCommentDocument>>(getModelToken(PostCommentModel.modelName));


        await createPlanOfSubscription(
            subscriptionPlanId_2,
            subscriptionPlanModel,
            40,
            40,
            40,
            "MP_PREAPPROVAL_ID_xx1"
        )

        await createSubscriptionForUser(
            subscriptionId_2,
            userId.toString(),
            subscriptionPlanId,
            subscriptionModel,
            "MP_PREAPPROVAL_ID_xx1"
        )


        await createPlanOfSubscription(
            subscriptionPlanId,
            subscriptionPlanModel,
            10,
            10,
            10,
            "MP_PREAPPROVAL_ID_1234"
        )

        await createSubscriptionForUser(
            subscriptionId,
            userId.toString(),
            subscriptionPlanId,
            subscriptionModel,
            "MP_PREAPPROVAL_ID_1234"
        )

    })



    afterAll(async () => {
        await subscriptionModel.deleteMany({});
        await subscriptionPlanModel.deleteMany({});
        await postCommentModel.deleteMany({});
        await connection.close();
    })


    afterEach(async () => {
        await userModel.deleteMany({});
        await postGoodModel.deleteMany({});
        await postServiceModel.deleteMany({});

    })

    describe('Desactivate and Activate post', () => {


        it('Desactivate Post', async () => {
            await createPersonalUser(userModel, { _id: userId, subscriptions: [subscriptionId] });
            await insertPostGood(postGoodModel, { _id: postId, imagesUrls: ["asd.com"], isActive: true, postBehaviourType: "libre", author: userId.toString() });
            await postService.activateOrDeactivatePost(postId.toString(), false, PostBehaviourType.libre, userId.toString());


            const post = await postGoodModel.findById(postId);
            expect(post).toBeDefined();
            expect(post?.isActive).toBe(false);
        })


        it('Activate Post without space in subscription plan, it should return error - LIBRE', async () => {
            let postArray: any[] = []
            let countOfPost = 10;


            for (let index = 0; index < countOfPost; index++) {
                let post: any = await insertPostGood(postGoodModel, { _id: new Types.ObjectId(), imagesUrls: ["asd.com"], isActive: true, postBehaviourType: "libre", author: userId.toString() });
                postArray.push(post._id);
            }

            await insertPostGood(postGoodModel, { _id: postId, imagesUrls: ["asd.com"], isActive: false, postBehaviourType: "libre", author: userId.toString() });
            await createPersonalUser(userModel, { _id: userId, posts: postArray, subscriptions: [subscriptionId] });



            await expect(postService.activateOrDeactivatePost(postId.toString(), true, PostBehaviourType.libre, userId.toString())).rejects.toThrow(BadRequestException)

            const post = await postGoodModel.findById(postId);
            expect(post).toBeDefined();
            expect(post?.isActive).toBe(false);
        })


        it('Activate Post with space in subscription plan, it should work success - LIBRE', async () => {
            let postArray: any[] = []
            let countOfPost = 5;

            for (let index = 0; index < countOfPost; index++) {
                let post: any = await insertPostGood(postGoodModel, { _id: new Types.ObjectId(), imagesUrls: ["asd.com"], isActive: true, postBehaviourType: "libre", author: userId.toString() });
                postArray.push(post._id);
            }

            await insertPostGood(postGoodModel, { _id: postId, imagesUrls: ["asd.com"], isActive: false, postBehaviourType: "libre", author: userId.toString() });
            await createPersonalUser(userModel, { _id: userId, posts: postArray, subscriptions: [subscriptionId] });


            await postService.activateOrDeactivatePost(postId.toString(), true, PostBehaviourType.libre, userId.toString())

            const post = await postGoodModel.findById(postId);
            expect(post).toBeDefined();
            expect(post?.isActive).toBe(true);
        })

        it('Activate Post without space in subscription plan, it should return error - AGENDA', async () => {
            let postArray: any[] = []
            let countOfPost = 10;


            for (let index = 0; index < countOfPost; index++) {
                let post: any = await insertPostGood(postGoodModel, { _id: new Types.ObjectId(), imagesUrls: ["asd.com"], isActive: true, postBehaviourType: "agenda", author: userId.toString() });
                postArray.push(post._id);
            }

            await insertPostGood(postGoodModel, { _id: postId, imagesUrls: ["asd.com"], isActive: false, postBehaviourType: "agenda", author: userId.toString() });
            await createPersonalUser(userModel, { _id: userId, posts: postArray, subscriptions: [subscriptionId] });



            await expect(postService.activateOrDeactivatePost(postId.toString(), true, PostBehaviourType.agenda, userId.toString())).rejects.toThrow(BadRequestException)

            const post = await postGoodModel.findById(postId);
            expect(post).toBeDefined();
            expect(post?.isActive).toBe(false);
        })


        it('Activate Post with space in subscription plan, it should work success - AGENDA', async () => {
            let postArray: any[] = []
            let countOfPost = 5;

            for (let index = 0; index < countOfPost; index++) {
                let post: any = await insertPostGood(postGoodModel, { _id: new Types.ObjectId(), imagesUrls: ["asd.com"], isActive: true, postBehaviourType: "agenda", author: userId.toString() });
                postArray.push(post._id);
            }

            await insertPostGood(postGoodModel, { _id: postId, imagesUrls: ["asd.com"], isActive: false, postBehaviourType: "agenda", author: userId.toString() });
            await createPersonalUser(userModel, { _id: userId, posts: postArray, subscriptions: [subscriptionId] });



            await postService.activateOrDeactivatePost(postId.toString(), true, PostBehaviourType.agenda, userId.toString())

            const post = await postGoodModel.findById(postId);
            expect(post).toBeDefined();
            expect(post?.isActive).toBe(true);
        })



    })


    describe('Desactivate Post if user not have subscription with space', () => {

        it('User not have subscription with space, should desactivate some posts', async () => {
            jest.spyOn(postRepository.getEmmiter, 'emitAsync').mockResolvedValue(true);

            let postArray: any[] = []
            let countOfPost = 30;

            for (let index = 0; index < countOfPost; index++) {
                let post: any = await insertPostGood(postGoodModel, {
                    _id: new Types.ObjectId(),
                    imagesUrls: ["asd.com"],
                    isActive: true,
                    postBehaviourType: "libre",
                    author: userId
                });
                postArray.push(post._id);
            }
            await createPersonalUser(userModel, { _id: userId, posts: postArray, subscriptions: [subscriptionId] });

            await postService.desactivatePostByUserId(userId.toString());

            const user: any = await userModel.findById(userId).select("posts").populate("posts");
            expect(user).toBeDefined();
            expect(user?.posts.length).toBe(30);

            let countOfActivePost = 0;
            for (let index = 0; index < user!.posts.length; index++) {
                if (user!.posts[index].isActive) {
                    countOfActivePost++;
                }
            }
            console.log("Inactive: ", countOfPost - countOfActivePost + " Active posts: ", countOfActivePost)
            expect(countOfActivePost).toBe(10);
        })


        it('User  have subscription with space, should dont desactivate posts', async () => {
            jest.spyOn(postRepository.getEmmiter, 'emitAsync').mockResolvedValue(true);

            let postArray: any[] = []
            let countOfPost = 10;

            for (let index = 0; index < countOfPost; index++) {
                let post: any = await insertPostGood(postGoodModel, {
                    _id: new Types.ObjectId(),
                    imagesUrls: ["asd.com"],
                    isActive: true,
                    postBehaviourType: "libre",
                    author: userId.toString()
                });
                postArray.push(post._id);
            }
            await createPersonalUser(userModel, { _id: userId, posts: postArray, subscriptions: [subscriptionId] });

            await postService.desactivatePostByUserId(userId.toString());

            const user: any = await userModel.findById(userId).select("posts").populate("posts");
            expect(user).toBeDefined();
            expect(user?.posts.length).toBe(10);

            let countOfActivePost = 0;
            for (let index = 0; index < user!.posts.length; index++) {
                if (user!.posts[index].isActive) {
                    countOfActivePost++;
                }
            }
            console.log("Inactive: ", countOfPost - countOfActivePost + " Active posts: ", countOfActivePost)
            expect(countOfActivePost).toBe(10);
        })


        it('User  have subscription with space, should dont desactivate posts', async () => {
            jest.spyOn(postRepository.getEmmiter, 'emitAsync').mockResolvedValue(true);

            let postArray: any[] = []
            let countOfPost = 7;

            for (let index = 0; index < countOfPost; index++) {
                let post: any = await insertPostGood(postGoodModel, {
                    _id: new Types.ObjectId(),
                    imagesUrls: ["asd.com"],
                    isActive: true,
                    postBehaviourType: "libre",
                    author: userId.toString()
                });
                postArray.push(post._id);
            }
            await createPersonalUser(userModel, { _id: userId, posts: postArray, subscriptions: [subscriptionId] });

            await postService.desactivatePostByUserId(userId.toString());

            const user: any = await userModel.findById(userId).select("posts").populate("posts");
            expect(user).toBeDefined();
            expect(user?.posts.length).toBe(7);

            let countOfActivePost = 0;
            for (let index = 0; index < user!.posts.length; index++) {
                if (user!.posts[index].isActive) {
                    countOfActivePost++;
                }
            }
            console.log("Inactive: ", countOfPost - countOfActivePost + " Active posts: ", countOfActivePost)
            expect(countOfActivePost).toBe(7);
        })





    })

    describe('Update Post', () => {

        it('Update a good post', async () => {

            const post = await insertPostGood(postGoodModel, {
                _id: new Types.ObjectId(),
                imagesUrls: ["asd.com"],
                isActive: true,
                postBehaviourType: "libre",
                author: userId.toString()
            });
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + 10);
            const updatePostRequest: PostUpdateDto = {
                title: "test update",
                description: "test update description",
                imagesUrls: ["asd.com", "abc.com"],
                brand: "test brand 22",
                year: 99,
                endDate: newDate,
            }

            await postService.updatePostById(updatePostRequest, post._id.toString(), "good");
            const postUpdated = await postGoodModel.findById(post._id);
            if (!postUpdated) {
                throw new NotFoundException();
            }
            expect(postUpdated.title).toBe(updatePostRequest.title);
            expect(postUpdated.description).toBe(updatePostRequest.description);
            expect(postUpdated.imagesUrls).toEqual(updatePostRequest.imagesUrls);
            expect(postUpdated.brand).toBe(updatePostRequest.brand);
            expect(postUpdated.year).toBe(updatePostRequest.year);
            expect(postUpdated.endDate).toEqual(updatePostRequest.endDate);




        })


        it('Update a service post', async () => {

            const post = await inserPostService(postServiceModel, {
                _id: new Types.ObjectId(),
                imagesUrls: ["asd.com"],
                isActive: true,
                postBehaviourType: "libre",
                author: userId.toString(),
                frequencyPrice: "day",
                endDate: new Date()
            });

            const newDate = new Date();
            newDate.setDate(newDate.getDate() + 10);

            const updatePostRequest: PostUpdateDto = {
                title: "test update",
                description: "test update description",
                imagesUrls: ["asd.com", "abc.com"],
                frequencyPrice: "week",
                endDate: newDate
            }

            await postService.updatePostById(updatePostRequest, post._id.toString(), "service");
            const postUpdated = await postServiceModel.findById(post._id);
            if (!postUpdated) {
                throw new NotFoundException();
            }
            expect(postUpdated.title).toBe(updatePostRequest.title);
            expect(postUpdated.description).toBe(updatePostRequest.description);
            expect(postUpdated.imagesUrls).toEqual(updatePostRequest.imagesUrls);
            expect(postUpdated.frequencyPrice).toBe(updatePostRequest.frequencyPrice);
            expect(postUpdated.endDate).toEqual(updatePostRequest.endDate);

        })


        it('Update a petition post', async () => {

            const post = await insertPostPetition(postPetitionModel, {
                _id: new Types.ObjectId(),
                imagesUrls: ["asd.com"],
                isActive: true,
                postBehaviourType: "libre",
                author: userId.toString(),
                toPrice: 100,
                frequencyPrice: "day",
                petitionType: "service",
                endDate: new Date()

            });

            const newDate = new Date();
            newDate.setDate(newDate.getDate() + 10);

            const updatePostRequest: PostUpdateDto = {
                title: "test update",
                description: "test update description",
                imagesUrls: ["asd.com", "abc.com"],
                frequencyPrice: "week",
                toPrice: 300,
                petitionType: "good",
                endDate: newDate
            }

            await postService.updatePostById(updatePostRequest, post._id.toString(), "petition");
            const postUpdated = await postPetitionModel.findById(post._id);
            if (!postUpdated) {
                throw new NotFoundException();
            }
            expect(postUpdated.title).toBe(updatePostRequest.title);
            expect(postUpdated.description).toBe(updatePostRequest.description);
            expect(postUpdated.frequencyPrice).toBe(updatePostRequest.frequencyPrice);
            expect(postUpdated.endDate).toEqual(updatePostRequest.endDate);

        })

        it('Update a with invalid type post', async () => {

            const post = await insertPostPetition(postPetitionModel, {
                _id: new Types.ObjectId(),
                imagesUrls: ["asd.com"],
                isActive: true,
                postBehaviourType: "libre",
                author: userId.toString(),
                toPrice: 100,
                frequencyPrice: "day",
                petitionType: "service",

            });

            const updatePostRequest: PostUpdateDto = {
                title: "test update",
            }

            await expect(postService.updatePostById(updatePostRequest, post._id.toString(), "testing")).rejects.toThrow(BadRequestException)
            const postUpdated = await postPetitionModel.findById(post._id);
            if (!postUpdated) {
                throw new NotFoundException();
            }
            expect(post.title).toBe(postUpdated.title);


        })
    })



    describe('Update End Date of post', () => {


        it('End Date of good post', async () => {
            const post = await insertPostGood(postGoodModel, {
                _id: new Types.ObjectId(),
                imagesUrls: ["asd.com"],
                isActive: true,
                postBehaviourType: "libre",
                author: userId.toString(),
                endDate: new Date(Date.now()),

            });


            const newDate: any = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Add 7 days to the current date

            await postService.updateEndDateFromPostById(post._id.toString(), userId.toString(), newDate);
            const postUpdated = await postGoodModel.findById(post._id);
            if (!postUpdated) {
                throw new NotFoundException();
            }
            expect(postUpdated.endDate).toEqual(newDate);
        })

    })


    describe('Update behaviour  type - Adapter', () => {


        it('Update behaviour type: Agenda - Post limit acepted - Visibility -> friend', async () => {
            let visibility = {
                post: "friends",
                socialMedia: "public"
            }
            let countOfPost = 30;
            let postArray = [];
            for (let index = 0; index < countOfPost; index++) {
                let post: any = await insertPostGood(postGoodModel, {
                    _id: new Types.ObjectId(),
                    imagesUrls: ["asd.com"],
                    isActive: true,
                    postBehaviourType: "libre",
                    author: userId.toString()
                });
                postArray.push(post._id);
            }

            await createPersonalUser(userModel, { _id: userId, posts: postArray, subscriptions: [subscriptionId, subscriptionId_2] });


            await postAdapter.updateBehaviourType(postArray[0].toString(), PostBehaviourType.agenda, userId.toString(), visibility as any);

            const postUpdated = await postGoodModel.findById(postArray[0])
            if (!postUpdated) {
                throw new NotFoundException();
            }
            expect(postUpdated.postBehaviourType).toBe(PostBehaviourType.agenda);

        })

        it('Update behaviour type: libre - Post limit acepted - Visibility -> public', async () => {
            let visibility = {
                post: "public",
                socialMedia: "public"
            }
            let countOfPost = 30;
            let postArray = [];
            for (let index = 0; index < countOfPost; index++) {
                let post: any = await insertPostGood(postGoodModel, {
                    _id: new Types.ObjectId(),
                    imagesUrls: ["asd.com"],
                    isActive: true,
                    postBehaviourType: "agenda",
                    author: userId.toString()
                });
                postArray.push(post._id);
            }

            await createPersonalUser(userModel, { _id: userId, posts: postArray, subscriptions: [subscriptionId, subscriptionId_2] });


            await postAdapter.updateBehaviourType(postArray[0].toString(), PostBehaviourType.libre, userId.toString(), visibility as any);

            const postUpdated = await postGoodModel.findById(postArray[0])
            if (!postUpdated) {
                throw new NotFoundException();
            }
            expect(postUpdated.postBehaviourType).toBe(PostBehaviourType.libre);

        })

        it('Update behaviour type: Agenda - Post limit exceeded - Visibility -> contacts', async () => {
            let visibility = {
                post: "contacts",
                socialMedia: "public"
            }
            let countOfPost = 50;
            let postArray = [];
            for (let index = 0; index < countOfPost; index++) {
                let post: any = await insertPostGood(postGoodModel, {
                    _id: new Types.ObjectId(),
                    imagesUrls: ["asd.com"],
                    isActive: true,
                    postBehaviourType: "agenda",
                    author: userId.toString()
                });
                postArray.push(post._id);
            }

            let post_libre: any = await insertPostGood(postGoodModel, {
                _id: new Types.ObjectId(),
                imagesUrls: ["asd.com"],
                isActive: true,
                postBehaviourType: "libre",
                author: userId.toString()
            });

            postArray.push(post_libre._id);
            await createPersonalUser(userModel, { _id: userId, posts: postArray, subscriptions: [subscriptionId, subscriptionId_2] });


            await expect(postAdapter.updateBehaviourType(post_libre._id.toString(), PostBehaviourType.agenda, userId.toString(), visibility as any))
                .rejects.toThrow(BadRequestException);

            const postUpdated = await postGoodModel.findById(post_libre._id)
            if (!postUpdated) {
                throw new NotFoundException();
            }
            expect(postUpdated.postBehaviourType).toBe(post_libre.postBehaviourType);

        })


        it('Update behaviour type: Libre - Post limit exceeded - Visibility -> public', async () => {
            let visibility = {
                post: "public",
                socialMedia: "public"
            }
            let countOfPost = 50;
            let postArray = [];
            for (let index = 0; index < countOfPost; index++) {
                let post: any = await insertPostGood(postGoodModel, {
                    _id: new Types.ObjectId(),
                    imagesUrls: ["asd.com"],
                    isActive: true,
                    postBehaviourType: "libre",
                    author: userId.toString()
                });
                postArray.push(post._id);
            }

            let post_agenda: any = await insertPostGood(postGoodModel, {
                _id: new Types.ObjectId(),
                imagesUrls: ["asd.com"],
                isActive: true,
                postBehaviourType: "agenda",
                author: userId.toString()
            });

            postArray.push(post_agenda._id);
            await createPersonalUser(userModel, { _id: userId, posts: postArray, subscriptions: [subscriptionId, subscriptionId_2] });


            await expect(postAdapter.updateBehaviourType(post_agenda._id.toString(), PostBehaviourType.libre, userId.toString(), visibility as any))
                .rejects.toThrow(BadRequestException);

            const postUpdated = await postGoodModel.findById(post_agenda._id)
            if (!postUpdated) {
                throw new NotFoundException();
            }
            expect(postUpdated.postBehaviourType).toBe(post_agenda.postBehaviourType);

        })


        it('Update behaviour type: Agenda - Post visibility is not public, should return an error', async () => {
            let visibility = {
                post: undefined,
                socialMedia: undefined
            }
            let countOfPost = 3;
            let postArray = [];
            for (let index = 0; index < countOfPost; index++) {
                let post: any = await insertPostGood(postGoodModel, {
                    _id: new Types.ObjectId(),
                    imagesUrls: ["asd.com"],
                    isActive: true,
                    postBehaviourType: "agenda",
                    author: userId.toString()
                });
                postArray.push(post._id);
            }


            await createPersonalUser(userModel, { _id: userId, posts: postArray, subscriptions: [subscriptionId, subscriptionId_2] });

            await expect(postAdapter.updateBehaviourType(postArray[0].toString(), PostBehaviourType.agenda, userId.toString(), visibility as any))
                .rejects.toThrow(BadRequestException);


            const postUpdated = await postGoodModel.findById(postArray[0])
            if (!postUpdated) {
                throw new NotFoundException();
            }
            expect(postUpdated.postBehaviourType).toBe("agenda");

        })

        it('Update behaviour type: Libre - Post visibility is wrong, should fix it and update the post', async () => {
            let visibility = {
                post: undefined,
                socialMedia: undefined
            }
            let countOfPost = 3;
            let postArray = [];
            for (let index = 0; index < countOfPost; index++) {
                let post: any = await insertPostGood(postGoodModel, {
                    _id: new Types.ObjectId(),
                    imagesUrls: ["asd.com"],
                    isActive: true,
                    postBehaviourType: "agenda",
                    author: userId.toString()
                });
                postArray.push(post._id);
            }


            await createPersonalUser(userModel, { _id: userId, posts: postArray, subscriptions: [subscriptionId, subscriptionId_2] });

            await postAdapter.updateBehaviourType(postArray[0].toString(), PostBehaviourType.libre, userId.toString(), visibility as any)


            const postUpdated = await postGoodModel.findById(postArray[0])
            if (!postUpdated) {
                throw new NotFoundException();
            }
            expect(postUpdated.postBehaviourType).toBe("libre");
            expect(postUpdated.visibility.post).toBe("public");

        })
    })



    describe('Update Comments in post', () => {

        it('Update commen being owner of the comment, should return work success and set isEdited to true', async () => {

            const postComment = await insertPostComment(postCommentModel, {
                _id: new Types.ObjectId(),
                comment: "hola",
                user: userId,
                isEdited: false,
            });


            await postService.updateCommentById(postComment._id.toString(), "hola editado", userId.toString())
            const response: any = await postCommentModel.findById(postComment._id)


            expect(response.isEdited).toBe(true);
            expect(response.comment).toBe("hola editado");


        })


        it('Update commen being external user, should not change the comment', async () => {
            const unauthorizedUserId = new Types.ObjectId();

            const postComment = await insertPostComment(postCommentModel, {
                _id: new Types.ObjectId(),
                comment: "hola",
                user: userId,
                isEdited: false,
            });


            await postService.updateCommentById(postComment._id.toString(), "hola editado 22", unauthorizedUserId.toString())
            const response: any = await postCommentModel.findById(postComment._id)


            expect(response.isEdited).toBe(false);
            expect(response.comment).toBe("hola");


        })
    })
})