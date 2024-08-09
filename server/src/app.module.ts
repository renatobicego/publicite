import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';  // Asegúrate de importar ConfigModule
import { WebhookModule } from './contexts/webhook/infraestructure/module/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Opcional: hace que las variables de entorno estén disponibles globalmente
    }),
    WebhookModule,
  ],
})
export class AppModule {}
