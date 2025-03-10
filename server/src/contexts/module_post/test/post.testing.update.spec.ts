import { TestingModule } from "@nestjs/testing";
import mongoose, { Connection } from "mongoose";
import mapModuleTesting from "./post.test.module";
import { PostService } from "../post/application/service/post.service";

describe('Post Service Testing ', () => {
    let connection: Connection;
    let postService: PostService;

    
    beforeAll(async () => {
        connection = mongoose.connection;
        const moduleRef: TestingModule = await mapModuleTesting.get("post")();  

        postService = moduleRef.get<PostService>('PostServiceInterface');

    })



    describe('Post Service Testing ', () => {

        it('Activate or desactivate Post', async () => {
            

        })

    })
})