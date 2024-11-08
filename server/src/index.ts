import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import * as express from 'express';
import * as compression from 'compression';
import { onRequest } from 'firebase-functions/v2/https';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';

const expressServer = express();
expressServer.use(compression());

let nestApp: NestExpressApplication;

const initializeNestApp = async (): Promise<void> => {
  if (!nestApp) {
    // Crear la aplicación HTTP
    nestApp = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new ExpressAdapter(expressServer),
    );
    nestApp.useGlobalPipes(new ValidationPipe({ transform: true }));
    nestApp.enableCors({});

    // Crear el microservicio gRPC
    const grpcApp = await NestFactory.createMicroservice(AppModule, {
      transport: Transport.GRPC,
      options: {
        package: 'notification',
        protoPath: join(__dirname, 'contexts/module_shared/socket/infrastructure/proto/notification.proto'),
        url: 'localhost:3001',
      },
    });

    await grpcApp.listen();

    await nestApp.init();
    console.log(`Server initialized`);
  }
};

export const api = onRequest(async (request, response) => {
  await initializeNestApp();
  expressServer(request, response);
});
