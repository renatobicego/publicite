import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import * as cookieParser from 'cookie-parser';
import * as path from 'path';
import * as dotenv from 'dotenv';
// import { Transport } from '@nestjs/microservices';
// import { join } from 'path';

async function bootstrap() {
  // rawBody: true expone req.rawBody para validar la firma del webhook de WhatsApp (YCloud).
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Subimos el límite del body parser: la generación contextual de imágenes
  // envía imágenes de referencia en base64 (una imagen de 1024x1024 supera
  // holgadamente el límite por defecto de ~100kb). Registramos los parsers de
  // express con un límite mayor antes de las rutas.
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));
  console.log('========================================');
  console.log(
    `🔵 Entorno actual (NODE_ENV): ${process.env.NODE_ENV || 'production (default)'}`,
  );
  console.log('========================================');

  // Usar el ValidationPipe globalmente
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableCors();

  app.use(cookieParser());

  const port = process.env.APP_PORT_LOCAL ?? 3002;
  await app.listen(port);
  console.log(`🚀 Backend escuchando en http://localhost:${port}`);
}

bootstrap();
