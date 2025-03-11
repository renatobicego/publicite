import { TestingModule } from "@nestjs/testing";
import mongoose, { Connection, Model, Types } from "mongoose";
import { getModelToken } from "@nestjs/mongoose";

import mapModuleTesting from "./post.test.module";
import { PostService } from "../post/application/service/post.service";
import { IPostGood } from "../post/infraestructure/schemas/post-types-schemas/post.good.schema";
import { insertPostGood } from "../../../../test/functions/create.post";
import { createPlanOfSubscription, createSubscriptionForUser } from "../../../../test/functions/create.planAndSub";
import { createPersonalUser } from "../../../../test/functions/create.user";
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import SubscriptionPlanModel, { SubscriptionPlanDocument } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscriptionPlan.schema";
import SubscriptionModel, { SubscriptionDocument } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscription.schema";
import { BadRequestException } from "@nestjs/common";


enum PostBehaviourType {
    libre = 'libre',
    agenda = 'agenda',
}

describe('Post Service Testing ', () => {
    let connection: Connection;
    let postService: PostService;

    let postGoodModel: Model<IPostGood>
    let userModel: Model<IUser>;
    let subscriptionPlanModel: Model<SubscriptionPlanDocument>
    let subscriptionModel: Model<SubscriptionDocument>


    const subscriptionPlanId = new Types.ObjectId("66c49508e80296e90ec637d9");
    const subscriptionId = new Types.ObjectId("66c49508e80296e90ec637d8");
    const postId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    beforeAll(async () => {
        connection = mongoose.connection;
        const moduleRef: TestingModule = await mapModuleTesting.get("post")();

        postService = moduleRef.get<PostService>('PostServiceInterface');
        postGoodModel = moduleRef.get<Model<IPostGood>>('PostGoodModel');
        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        subscriptionPlanModel = moduleRef.get<Model<SubscriptionPlanDocument>>(getModelToken(SubscriptionPlanModel.modelName));
        subscriptionModel = moduleRef.get<Model<SubscriptionDocument>>(getModelToken(SubscriptionModel.modelName));
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
        await connection.close();
    })


    afterEach(async () => {
        await userModel.deleteMany({});
        await postGoodModel.deleteMany({});

    })

    describe('Post Service Testing - Desactivate and Activate post', () => {


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

})