import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import * as compression from 'compression';
import { onRequest } from 'firebase-functions/v2/https';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// Create an instance of Express server
const expressServer = express();

// Apply compression middleware
expressServer.use(compression());

let nestApp: NestExpressApplication;

// Function to initialize NestJS application
const initializeNestApp = async (): Promise<void> => {
  if (!nestApp) {
    nestApp = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new ExpressAdapter(expressServer),
    );
    nestApp.useGlobalPipes(new ValidationPipe({ transform: true }));
    nestApp.enableCors({});
    await nestApp.init();
  }
};

// Export Firebase function
export const api = onRequest(async (request, response) => {
  await initializeNestApp();
  expressServer(request, response);
});
