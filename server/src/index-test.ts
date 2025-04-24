import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as path from 'path';
import * as dotenv from 'dotenv';
// import { Transport } from '@nestjs/microservices';
// import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('========================================');
  console.log(
    `🔵 Entorno actual (NODE_ENV): ${process.env.NODE_ENV || 'production (default)'}`,
  );
  console.log('========================================');

  // Usar el ValidationPipe globalmente
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableCors();

  app.use(cookieParser());

  await app.listen(3001);
}

bootstrap();
