import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService  } from '@nestjs/config';





async function bootstrap() {
  const configService = new ConfigService();
  const APP_PORT = configService.get<string>('APP_PORT');
  const app = await NestFactory.create(AppModule,
    { logger: ['error', 'warn', 'debug', 'log', 'verbose'] },
  );
  await app.listen(APP_PORT?? "");
}
bootstrap();
