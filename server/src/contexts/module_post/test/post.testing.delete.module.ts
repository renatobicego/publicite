import mongoose, { Connection, Types } from "mongoose";
import { TestingModule } from "@nestjs/testing";


import { PostService } from "../post/application/service/post.service";
import mapModuleTesting from "./post.test.module";
import { inserPostService } from "test/functions/create.post";

describe('Pst Service Testing - Delete Post', () => {
    let connection: Connection;
    let postService: PostService;

    beforeAll(async () => {
        connection = mongoose.connection;
        const moduleRef: TestingModule = await mapModuleTesting.get("post")();
        postService = moduleRef.get<PostService>('PostServiceInterface');

    })



    it('Delete post by id without re ', async () => {
        const postToDelete = await inserPostService(postService, {
            _id: new Types.ObjectId(),
            title: "Post 1",
        })


        

        




    })


})