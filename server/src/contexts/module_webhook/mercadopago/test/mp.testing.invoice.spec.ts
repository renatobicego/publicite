import { TestingModule } from "@nestjs/testing";
import mongoose, { Connection, Model, Models } from "mongoose";


import mpTestingModule from "./test.module";
import { MpHandlerEvents } from "../infastructure/adapters/handler/mpHandlerFETCHEvents";


describe('MercadopagoService - Invoice', () => {
    let connection: Connection;
    let mpHandlerEvents: MpHandlerEvents;


    beforeAll(async () => {


        connection = mongoose.connection;
        const moduleRef: TestingModule = await mpTestingModule.get("mp_testing_module")();
        mpHandlerEvents = moduleRef.get<MpHandlerEvents>('MpHandlerEventsInterface');


    });

    afterAll(async () => {
        await connection.close();

    });




    it('Should create subscription ', async () => {


    });








})// end