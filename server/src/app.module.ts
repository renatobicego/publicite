import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Asegúrate de importar ConfigModule
import { APP_FILTER } from '@nestjs/core';

import { WebhookModule } from './contexts/webhook/infraestructure/module/webhook.module';
import { DatabaseModule } from './contexts/shared/database/infraestructure/database.module';
import { LoggerModule } from './contexts/shared/logger/logger.module';
import { UserModule } from './contexts/user/infraestructure/module/user.module';
import { AllExceptionsFilter } from './contexts/shared/exceptionFilter/infraestructure/exception.filter';
import { ContactModule } from './contexts/contact/infraestructure/module/contact.module';
import { SectorModule } from './contexts/businessSector/infraestructure/module/sector.module';
import { DatabaseService } from './contexts/shared/database/infraestructure/database.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Opcional: hace que las variables de entorno estén disponibles globalmente
    }),
    WebhookModule,
    UserModule,
    DatabaseModule,
    LoggerModule,
    ContactModule,
    SectorModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    DatabaseService,
  ],
})
export class AppModule {}
