// import { Transport } from '@nestjs/microservices';
// import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import * as express from 'express';
import * as compression from 'compression';
import { onRequest } from 'firebase-functions/v2/https';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';


const expressServer = express();
expressServer.use(compression());

let nestApp: NestExpressApplication;

const initializeNestApp = async (): Promise<void> => {
  dotenv.config({ path: '.env' });
  const PUBLICITE_CORS_VERCEL_URI = process.env.PUBLICITE_CORS_VERCEL_URI ?? "Verify PUBLICITE_CORS_VERCEL_URI";
  const PUBLICITE_CORS_DOMAIN_URI = process.env.PUBLICITE_CORS_DOMAIN_URI ?? "Verify PUBLICITE_CORS_DOMAIN_URI";
  const PUBLICITE_CORS_SOCKET_URI = process.env.PUBLICITE_CORS_SOCKET_URI ?? "Verify PUBLICITE_CORS_SOCKET_URI";
  const PUBLICITE_CORS_GRAPHQL_URI = process.env.PUBLICITE_CORS_GRAPHQL_URI ?? "Verify PUBLICITE_CORS_GRAPHQL_URI";
  if (!nestApp) {
    // Crear la aplicación HTTP
    nestApp = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new ExpressAdapter(expressServer),
      { cors: true },
    );
    nestApp.useGlobalPipes(new ValidationPipe({ transform: true }));

    nestApp.enableCors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          PUBLICITE_CORS_VERCEL_URI,
          PUBLICITE_CORS_DOMAIN_URI,
          PUBLICITE_CORS_SOCKET_URI,
          PUBLICITE_CORS_GRAPHQL_URI
        ];


        const allowedPatterns = allowedOrigins.map((url) => new RegExp(`^${url.replace(/\/$/, '')}(/.*)?$`));


        if (allowedPatterns.some((pattern) => pattern.test(origin))) {
          return callback(null, true);
        } else {
          return callback(new Error(`CORS bloqueado: ${origin} no está permitido`));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      optionsSuccessStatus: 200,
    });



    // Crear el microservicio gRPC
    // const grpcApp = await NestFactory.createMicroservice(AppModule, {
    //   transport: Transport.GRPC,
    //   options: {
    //     package: 'notification',
    //     protoPath: join(__dirname, 'contexts/module_shared/socket/infrastructure/proto/notification.proto'),
    //     url: '0.0.0.0:3001',
    //   },
    // });

    //await grpcApp.listen();

    await nestApp.init();
    console.log(`Server initialized`);
  }
};

export const api = onRequest(async (request, response) => {
  await initializeNestApp();
  expressServer(request, response);
});
