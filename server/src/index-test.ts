import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
// import { Transport } from '@nestjs/microservices';
// import { join } from 'path';
import * as dotenv from 'dotenv';


async function bootstrap() {
  dotenv.config({ path: '.env' });
  const PUBLICITE_CORS_VERCEL_URI = process.env.PUBLICITE_CORS_VERCEL_URI ?? "Verify PUBLICITE_CORS_VERCEL_URI";
  const PUBLICITE_CORS_DOMAIN_URI = process.env.PUBLICITE_CORS_DOMAIN_URI ?? "Verify PUBLICITE_CORS_DOMAIN_URI";
  const PUBLICITE_CORS_SOCKET_URI = process.env.PUBLICITE_CORS_SOCKET_URI ?? "Verify PUBLICITE_CORS_SOCKET_URI";
  const app = await NestFactory.create(AppModule, { cors: true });

  // Usar el ValidationPipe globalmente
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        PUBLICITE_CORS_VERCEL_URI,
        PUBLICITE_CORS_DOMAIN_URI,
        PUBLICITE_CORS_SOCKET_URI,
      ];
      
      if (!origin) {

        return callback(new Error("CORS bloqueado: origen no permitido"));
      }
  
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS bloqueado: origen no permitido"));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, 
    optionsSuccessStatus: 200,
  });


  app.use(cookieParser());

  await app.listen(3001);

}

bootstrap();
