import * as dotenv from 'dotenv';
import { Test, TestingModule } from "@nestjs/testing";
import { Connection } from "mongoose";
import { DatabaseService } from 'src/contexts/module_shared/database/infrastructure/database.service';
import { AppModule } from 'src/app.module';
import { INestApplication } from '@nestjs/common';


async function startServerForE2ETest(): Promise<{
    module: TestingModule,
    databaseConnection: Connection,
    SOCKET_SECRET: string,
    application: INestApplication<any>,
    server: any
}> {
    dotenv.config({ path: '.env.test' });
    let SOCKET_SECRET = process.env.PUBLICITE_SOCKET_API_KEY!;
    let db = process.env.DATABASE_URI_TEST!;
    console.log(db)
    
    const module = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    let application = module.createNestApplication();
    await application.init();

    let databaseConnection = module
        .get<DatabaseService>(DatabaseService)
        .getDBHandle();
    const server = application.getHttpServer();

    return { module, databaseConnection, SOCKET_SECRET, application, server }
}


export default startServerForE2ETest