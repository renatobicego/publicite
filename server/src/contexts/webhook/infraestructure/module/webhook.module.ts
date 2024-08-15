import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebhookService } from '../../application/clerk/clerkWebhook.service';
import { ClerkWebhookAdapter } from '../adapters/clerk/clerk-webhook.adapter';
import { WebhookController } from '../controllers/webhook.controller';
import { UserModule } from 'src/contexts/user/infraestructure/module/user.module';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { MpWebhookService } from '../../application/mercadopago/mpWebhook.service';
import { MpWebhookAdapter } from '../adapters/mercadopago/mp-webhook.adapter';
import { MpWebhookServiceInterface } from '../../domain/mercadopago/service/mpWebhookServiceInterface';

@Module({
  imports: [
    UserModule, // Importa el UserModule que posiblemente sea necesario en tu WebhookModule
    ConfigModule.forRoot(), // Importa ConfigModule para manejar variables de entorno
  ],
  controllers: [WebhookController], // Controlador del módulo
  providers: [
    // Proveedor para ClerkWebhookAdapter
    {
      provide: ClerkWebhookAdapter,
      useFactory: (
        webhookService: WebhookService,
        configService: ConfigService,
      ) => {
        const WEBHOOK_SECRET = configService.get<string>('WEBHOOK_SECRET');
        if (!WEBHOOK_SECRET) {
          throw new Error(
            'Please add WEBHOOK_SECRET to your environment variables',
          );
        }
        return new ClerkWebhookAdapter(webhookService, WEBHOOK_SECRET);
      },
      inject: [WebhookService, ConfigService], // Inyecta dependencias necesarias
    },
    WebhookService, // Servicio para Webhook de Clerk
    MyLoggerService, // Servicio de logging
    
    // Proveedor para MpWebhookAdapter
    {
      provide: MpWebhookAdapter,
      useFactory: (
        configService: ConfigService,
        mpWebhookService: MpWebhookServiceInterface, // Inyecta la interfaz MpWebhookServiceInterface
        loggerService: MyLoggerService,
      ) => {
        return new MpWebhookAdapter(configService, mpWebhookService, loggerService);
      },
      inject: [ConfigService, 'MpWebhookServiceInterface', MyLoggerService], // Inyecta dependencias
    },

    // Registro de la implementación de MpWebhookServiceInterface
    {
      provide: 'MpWebhookServiceInterface', // Provee la interfaz como token
      useClass: MpWebhookService, // Usa la implementación MpWebhookService
    },
  ],
})
export class WebhookModule {}
