import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebhookService } from '../../application/clerk/clerkWebhook.service';
import { ClerkWebhookAdapter } from '../adapters/clerk/clerk-webhook.adapter';
import { WebhookController } from '../controllers/webhook.controller';
import { UserModule } from 'src/contexts/user/infraestructure/module/user.module';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { MpWebhookService } from '../../application/mercadopago/mpWebhook.service';
import { MpWebhookAdapter } from '../adapters/mercadopago/mp-webhook.adapter';
import SubPreapprovalRepository from '../repository/mercadopago/sub_preapproval.respository';
import { SubscriptionSchema } from '../schemas/mercadopago/subscription.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    UserModule, // Importa el UserModule que posiblemente sea necesario en tu WebhookModule
    ConfigModule.forRoot(), // Importa ConfigModule para manejar variables de entorno
    MongooseModule.forFeature([{ name: 'Subscription', schema: SubscriptionSchema }]),
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
    MpWebhookAdapter,
    {
      provide: 'MpWebhookServiceInterface',
      useClass: MpWebhookService,
    },
    {
      provide: 'SubPreapprovalRepositoryInterface',
      useClass: SubPreapprovalRepository,

    },
    

    
  ],
})
export class WebhookModule {}
