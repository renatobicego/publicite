import { getModelToken } from "@nestjs/mongoose";
import { TestingModule } from "@nestjs/testing";
import mongoose, { Connection, Model, Models } from "mongoose";


import mpTestingModule from "./test.module";


describe('MercadopagoService - Invoice', () => {
    let connection: Connection;



    beforeAll(async () => {


        connection = mongoose.connection;
        const moduleRef: TestingModule = await mpTestingModule.get("mp_testing_module")();



    });

    afterAll(async () => {
        await connection.close();

    });




    it('', async () => {


    });








})// end