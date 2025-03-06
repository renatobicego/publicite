import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
// import { Transport } from '@nestjs/microservices';
// import { join } from 'path';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Usar el ValidationPipe globalmente
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Habilitar CORS
  app.enableCors();

  app.use(cookieParser());

  // // Configuración de Swagger
  // const config = new DocumentBuilder()
  //   .setTitle('Publicite API documentation')
  //   .setDescription('Publicite - API documentation')
  //   .setVersion('1.0')
  //   .addTag('Endpoints 🚀')
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);

  // SwaggerModule.setup('api', app, document);
  //  // La documentación estará disponible en /api
  // //Racibe las cookies y las hace un populate


  // const grpcApp = await NestFactory.createMicroservice(AppModule, {
  //   transport: Transport.GRPC,
  //   options: {
  //     package: 'notification',
  //     protoPath: join(__dirname, 'contexts/module_shared/socket/infrastructure/proto/notification.proto'),
  //     url: 'localhost:3001',
  //   },
  // });

  //await grpcApp.listen();  


  await app.listen(3001);
}

bootstrap();
