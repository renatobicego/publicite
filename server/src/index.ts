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
import * as path from 'path';

import { AppModule } from './app.module';
import { defineInt } from 'firebase-functions/params';
import { params } from 'firebase-functions/v2';

const expressServer = express();
expressServer.use(compression());

let nestApp: NestExpressApplication;

const initializeNestApp = async (): Promise<void> => {
  const envPath = path.resolve(
    __dirname,
    process.env.NODE_ENV === 'qa' ? '.env.qa' : '.env',
  );
  dotenv.config({ path: envPath });
  const PUBLICITE_CORS_VERCEL_URI =
    process.env.PUBLICITE_CORS_VERCEL_URI ?? 'Verify PUBLICITE_CORS_VERCEL_URI';
  const PUBLICITE_CORS_DOMAIN_URI =
    process.env.PUBLICITE_CORS_DOMAIN_URI ?? 'Verify PUBLICITE_CORS_DOMAIN_URI';
  const PUBLICITE_CORS_SOCKET_URI =
    process.env.PUBLICITE_CORS_SOCKET_URI ?? 'Verify PUBLICITE_CORS_SOCKET_URI';
  const PUBLICITE_CORS_GRAPHQL_URI =
    process.env.PUBLICITE_CORS_GRAPHQL_URI ??
    'Verify PUBLICITE_CORS_GRAPHQL_URI';
  const PUBLICITE_CORS_ORIGIN = process.env.PUBLICITE_CORS_ORIGIN ?? undefined;
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
          PUBLICITE_CORS_GRAPHQL_URI,
          PUBLICITE_CORS_ORIGIN,
        ];
        const allowedPatterns = allowedOrigins.map(
          (url) => new RegExp(`^${url?.replace(/\/$/, '')}(/.*)?$`),
        );

        if (allowedPatterns.some((pattern) => pattern.test(origin))) {
          return callback(null, true);
        } else {
          return callback(
            new Error(`CORS bloqueado: ${origin} no está permitido`),
          );
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

const memory = defineInt('MEMORY', {
  description: 'How much memory do you need?',
  input: params.select({ micro: 256, '1GIB': 1024, '2GIB': 2048 }),
});

export const api = onRequest({ memory: memory }, async (request, response) => {
  await initializeNestApp();
  expressServer(request, response);
});
