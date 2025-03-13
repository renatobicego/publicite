import mongoose, { Connection, Model, Types } from "mongoose";
import { TestingModule } from "@nestjs/testing";


import { PostService } from "../post/application/service/post.service";
import mapModuleTesting from "./post.test.module";
import { insertPostGood } from "../../../../test/functions/post/create.post";
import { createPersonalUser } from "../../../../test/functions/user/create.user";
import { IUser } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { IPostGood, PostGoodModel } from "../post/infraestructure/schemas/post-types-schemas/post.good.schema";
import PostReactionModel, { PostReactionDocument } from "../post/infraestructure/schemas/post.reaction.schema";
import PostCommentModel, { PostCommentDocument } from "../post/infraestructure/schemas/post.comment.schema";
import PostReviewModel, { PostReviewDocument } from "../PostReview/infrastructure/schemas/review.schema";
import { insertPostComment } from "../../../../test/functions/post/create.postComment";
import { insertPostReview } from "../../../../test/functions/post/create.postReview";
import { insertPostReaction } from "../../../../test/functions/post/create.postReaction";
import { get } from "lodash";
import { getModelToken } from "@nestjs/mongoose";


describe('Pst Service Testing - Delete Post', () => {
    let connection: Connection;
    let postService: PostService;

    let postGoodModel: Model<IPostGood>
    let userModel: Model<IUser>;
    let postReactionModel: Model<PostReactionDocument>
    let postCommentModel: Model<PostCommentDocument>
    let postReviewModel: Model<PostReviewDocument>


    beforeAll(async () => {
        connection = mongoose.connection;
        const moduleRef: TestingModule = await mapModuleTesting.get("post")();
        postService = moduleRef.get<PostService>('PostServiceInterface');

        userModel = moduleRef.get<Model<IUser>>('UserModel');
        postGoodModel = moduleRef.get<Model<IPostGood>>(getModelToken(PostGoodModel.modelName));
        postCommentModel = moduleRef.get<Model<PostCommentDocument>>(getModelToken(PostCommentModel.modelName));
        postReactionModel = moduleRef.get<Model<PostReactionDocument>>(getModelToken(PostReactionModel.modelName));
        postReviewModel = moduleRef.get<Model<PostReviewDocument>>(getModelToken(PostReviewModel.modelName));
    })

    afterEach(async () => {
        await userModel.deleteMany({});
        await postGoodModel.deleteMany({});
        await postCommentModel.deleteMany({});
        await postReactionModel.deleteMany({});
        await postReviewModel.deleteMany({});
    })


    it('Delete post by id without reactions, reviews or comments ', async () => {
        const postId = new Types.ObjectId();
        const userOwnerPost = await createPersonalUser(
            userModel, {
            _id: new Types.ObjectId(),
            posts: [postId],
        }
        )

        const postToDelete = await insertPostGood(postGoodModel, {
            _id: postId,
            title: "Post 1",
            author: userOwnerPost._id,
        })

        await postService.deletePostById(postToDelete._id);
        const postDeleted = await postService.findPostById(postToDelete._id);
        expect(postDeleted).toBeNull();

        const user = await userModel.findOne({ _id: userOwnerPost._id })
        expect(user?.posts.length).toBe(0);
    })


    it('Delete post by id with reactions, reviews and comments with response, should delete all schemas ', async () => {
        const postId = new Types.ObjectId();
        const userOwnerPost = await createPersonalUser(
            userModel, {
            _id: new Types.ObjectId(),
            posts: [postId],
        }
        )


        const comment = await insertPostComment(postCommentModel, {
            _id: new Types.ObjectId(),
            comment: "Comment 1",
            user: userOwnerPost._id,
            response: new Types.ObjectId(),
        })
        expect(await postCommentModel.findById(comment._id)).toBeTruthy();

        const review = await insertPostReview(postReviewModel, {
            _id: new Types.ObjectId(),
            author: new Types.ObjectId(),
            review: "Review 1",
            rating: 5
        })
        expect(await postReviewModel.findById(review._id)).toBeTruthy();

        // const postReaction = await insertPostReaction(postReactionModel, {
        //     _id: new Types.ObjectId(),
        // })
        // expect(postReactionModel.findById(postReaction._id)).toBeTruthy();


        const postToDelete = await insertPostGood(postGoodModel, {
            _id: postId,
            title: "Post 1",
            author: userOwnerPost._id,
            comments: [comment._id],
            reviews: [review._id],
            //reactions: [postReaction],
        })


        await postService.deletePostById(postToDelete._id);

        const postDeleted = await postService.findPostById(postToDelete._id);
        expect(postDeleted).toBeNull();

        const user = await userModel.findOne({ _id: userOwnerPost._id })
        expect(user?.posts.length).toBe(0);


        expect(await postCommentModel.findById(comment._id)).toBeNull();
        expect(await postReviewModel.findById(review._id)).toBeNull();
        //expect(postReactionModel.findById(postReaction._id)).toBeNull();
    })


})