import { Connection } from "mongoose";
import * as request from 'supertest';


import startServerForE2ETest from "../../../test/getStartede2e-test";

describe('Contact seller notifications test', () => {
    let dbConnection: Connection;
    let httpServer: any;
    let app: any;
    let moduleRef: any
    let PUBLICITE_SOCKET_API_KEY: string;


    beforeAll(async () => {
        const {
            databaseConnection,
            application,
            server,
            module,
            SOCKET_SECRET } = await startServerForE2ETest();
        moduleRef = module
        dbConnection = databaseConnection
        app = application
        httpServer = server
        PUBLICITE_SOCKET_API_KEY= SOCKET_SECRET
    })


    it('should be defined', async () => {

            



        const response = await request(httpServer)
            .post('/socket/contact-seller')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send()

    })
})
