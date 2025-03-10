import { TestingModule } from "@nestjs/testing";
import mongoose, { Connection } from "mongoose";
import mapModuleTesting from "./post.test.module";

describe('Post Service Testing ', () => {
    let connection: Connection;

    beforeAll(async () => {
        connection = mongoose.connection;
        const moduleRef: TestingModule = await mapModuleTesting.get("post")();
    })



    describe('Post Service Testing ', () => {

        it('Activate or desactivate Post', async () => {

        })

    })
})