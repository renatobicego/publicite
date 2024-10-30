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
import * as http from 'http';
import { Server } from 'socket.io';

// Create an instance of Express server
const expressServer = express();

// Apply compression middleware
expressServer.use(compression());

let nestApp: NestExpressApplication;
let io: Server;

const initializeNestApp = async (): Promise<void> => {
  if (!nestApp) {
    nestApp = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new ExpressAdapter(expressServer),
    );
    nestApp.useGlobalPipes(new ValidationPipe({ transform: true }));
    nestApp.enableCors({});
    await nestApp.init();

    const server = http.createServer(expressServer);
    io = new Server(server, {
      path: '/socket.io',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

      // Define other event handlers here
    });

    console.log(`Server running`);
  }
};

// Export Firebase function
export const api = onRequest(async (request, response) => {
  await initializeNestApp();
  expressServer(request, response);
});
