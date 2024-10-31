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
import { WebSocketServer } from 'ws';

const expressServer = express();
expressServer.use(compression());

let nestApp: NestExpressApplication;
let io: Server;

const wss = new WebSocketServer({ noServer: true });

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
      path: 'https://api-7u63p4eg4q-uc.a.run.app/socket',
      transports: ['websocket', 'polling'],
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
    });

    console.log(`Server initialized`);
  }
};

export const api = onRequest(async (request, response) => {
  await initializeNestApp();
  expressServer(request, response);
});
