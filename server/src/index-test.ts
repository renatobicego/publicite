import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
// import { Transport } from '@nestjs/microservices';
// import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Usar el ValidationPipe globalmente
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableCors();

  app.use(cookieParser());

  await app.listen(3001);
}

bootstrap();
