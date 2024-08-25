import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Asegúrate de importar ConfigModule

import { WebhookModule } from './contexts/webhook/infraestructure/module/webhook.module';
// import { UserModule } from './contexts/user/infraestructure/module/user.module';
import { DatabaseModule } from './contexts/shared/database/infraestructure/database.module';
import { LoggerModule } from './contexts/shared/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Opcional: hace que las variables de entorno estén disponibles globalmente
    }),
    WebhookModule,
    //UserModule,
    DatabaseModule,
    LoggerModule,
  ],
})
export class AppModule {}
