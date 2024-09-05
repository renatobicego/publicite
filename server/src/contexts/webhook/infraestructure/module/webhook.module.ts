import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { UserModule } from 'src/contexts/user/infraestructure/module/user.module';
import { WebhookService } from '../../application/clerk/clerkWebhook.service';
import { MpHandlerValidations } from '../../application/mercadopago/handler/mp.handler.validations';
import { MpHandlerEvents } from '../../application/mercadopago/handler/mpHandlerEvents';
import { MpSubscriptionService } from '../../application/mercadopago/service/mpSubscription.service';
import { MpWebhookService } from '../../application/mercadopago/service/mpWebhook.service';
import { ClerkWebhookAdapter } from '../adapters/clerk/clerk-webhook.adapter';
import { SubscriptionAdapter } from '../adapters/mercadopago/mp-subscription.adapter';
import { MpWebhookAdapter } from '../adapters/mercadopago/mp-webhook.adapter';
import { SubscriptionController } from '../controllers/subscription.controller';
import { WebhookController } from '../controllers/webhook.controller';
import MercadoPagoEventsRepository from '../repository/mercadopago/mpEvents.repository';
import { SubscriptionRepository } from '../repository/mercadopago/subscription.repository';
import { InvoiceSchema } from '../schemas/mercadopago/invoice.schema';
import { PaymentSchema } from '../schemas/mercadopago/payment.schema';
import { SubscriptionSchema } from '../schemas/mercadopago/subscription.schema';
import { SubscriptionPlanSchema } from '../schemas/mercadopago/subscriptionPlan.schema';

@Module({
  imports: [
    //UserModule, // Importa el UserModule que posiblemente sea necesario en tu WebhookModule
    ConfigModule.forRoot(), // Importa ConfigModule para manejar variables de entorno

    //Definimos los modelos que utilizara el modulo
    MongooseModule.forFeature([
      { name: 'Subscription', schema: SubscriptionSchema },
      { name: 'Invoice', schema: InvoiceSchema },
      { name: 'Payment', schema: PaymentSchema },
      { name: 'SubscriptionPlan', schema: SubscriptionPlanSchema },
    ]),
    UserModule,
  ],
  controllers: [WebhookController, SubscriptionController], // Controlador del módulo
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
      provide: 'MercadoPagoEventsRepositoryInterface',
      useClass: MercadoPagoEventsRepository,
    },
    {
      provide: 'MpHandlerEventsInterface',
      useClass: MpHandlerEvents,
    },
    {
      provide: 'SubscriptionAdapterInterface',
      useClass: SubscriptionAdapter,
    },
    {
      provide: 'SubscriptionRepositoryInterface',
      useClass: SubscriptionRepository,
    },
    {
      provide: 'SubscriptionServiceInterface',
      useClass: MpSubscriptionService,
    },
    {
      provide: 'MpHandlerValidationsInterface',
      useFactory: (configService: ConfigService, logger: MyLoggerService) => {
        return new MpHandlerValidations(configService, logger);
      },
      inject: [ConfigService, MyLoggerService], // Inyecta las dependencias
    },
  ],
})
export class WebhookModule {}
