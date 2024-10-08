import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MyLoggerService } from '../../../shared/logger/logger.service';
import { UserModule } from 'src/contexts/user/infrastructure/module/user.module';
import { WebhookService } from '../../application/clerk/clerkWebhook.service';
import { MpHandlerValidations } from '../../application/mercadopago/handler/mp.handler.validations';
import { MpHandlerEvents } from '../../application/mercadopago/handler/mpHandlerFETCHEvents';
import { MpSubscriptionService } from '../../application/mercadopago/service/mp-subscription.service';
import { MpWebhookService } from '../../application/mercadopago/service/mp-webhook.service';
import { ClerkWebhookAdapter } from '../adapters/clerk/clerk-webhook.adapter';
import { SubscriptionAdapter } from '../adapters/mercadopago/mp-subscription.adapter';
import { MpWebhookAdapter } from '../adapters/mercadopago/mp-webhook.adapter';
import { SubscriptionController } from '../controllers/mp-subscription.controller';
import { WebhookController } from '../controllers/webhook.controller';
import MercadoPagoEventsRepository from '../repository/mercadopago/mp-events.repository';
import { SubscriptionRepository } from '../repository/mercadopago/mp-subscription.repository';
import { InvoiceSchema } from '../schemas/mercadopago/invoice.schema';
import { PaymentSchema } from '../schemas/mercadopago/payment.schema';
import { SubscriptionSchema } from '../schemas/mercadopago/subscription.schema';
import { SubscriptionPlanSchema } from '../schemas/mercadopago/subscriptionPlan.schema';
import { MpInvoiceAdapter } from '../adapters/mercadopago/mp-invoice.adapter';
import { MpInvoiceService } from '../../application/mercadopago/service/mp-invoice.service';
import { MpInvoiceRepository } from '../repository/mercadopago/mp-invoice.repository';
import { MercadopagoSubscriptionPlanController } from '../controllers/mp-subscriptionPlan.controller';
import { MercadoPagoSubscriptionPlanAdapter } from '../adapters/mercadopago/mp-subscriptionPlan.adapter';
import { LoggerModule } from 'src/contexts/shared/logger/logger.module';
import { MercadoPagoSubscriptionPlanService } from '../../application/mercadopago/service/mp-subscriptionPlan.service';
import { MercadoPagoSubscriptionPlanRepository } from '../repository/mercadopago/mp-subscriptionPlan.repository';
import { MpPaymentService } from '../../application/mercadopago/service/mp-payment.service';
import { MercadoPagoPaymentsRepository } from '../repository/mercadopago/mp-payments.repository';

@Module({
  imports: [
    //UserModule, // Importa el UserModule que posiblemente sea necesario en tu WebhookModule
    //ConfigModule.forRoot(), // Importa ConfigModule para manejar variables de entorno

    //Definimos los modelos que utilizara el modulo
    MongooseModule.forFeature([
      { name: 'Subscription', schema: SubscriptionSchema },
      { name: 'Invoice', schema: InvoiceSchema },
      { name: 'Payment', schema: PaymentSchema },
      { name: 'SubscriptionPlan', schema: SubscriptionPlanSchema },
    ]),
    UserModule,
    LoggerModule,
  ],
  controllers: [
    WebhookController,
    SubscriptionController,
    MercadopagoSubscriptionPlanController,
  ], // Controlador del módulo
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
    WebhookService,
    MpWebhookAdapter,
    {
      provide: 'MpHandlerEventsInterface',
      useClass: MpHandlerEvents,
    },
    {
      provide: 'MpWebhookServiceInterface',
      useClass: MpWebhookService,
    },
    {
      provide: 'MpServiceInvoiceInterface',
      useClass: MpInvoiceService,
    },
    {
      provide: 'MpPaymentServiceInterface',
      useClass: MpPaymentService,
    },
    {
      provide: 'MercadoPagoSubscriptionPlanServiceInterface',
      useClass: MercadoPagoSubscriptionPlanService,
    },

    {
      provide: 'SubscriptionServiceInterface',
      useClass: MpSubscriptionService,
    },
    {
      provide: 'MercadoPagoEventsRepositoryInterface',
      useClass: MercadoPagoEventsRepository,
    },
    {
      provide: 'MercadoPagoInvoiceRepositoryInterface',
      useClass: MpInvoiceRepository,
    },
    {
      provide: 'SubscriptionRepositoryInterface',
      useClass: SubscriptionRepository,
    },
    {
      provide: 'MercadoPagoPaymentsRepositoryInterface',
      useClass: MercadoPagoPaymentsRepository,
    },
    {
      provide: 'MercadoPagoSubscriptionPlanRepositoryInterface',
      useClass: MercadoPagoSubscriptionPlanRepository,
    },
    {
      provide: 'SubscriptionAdapterInterface',
      useClass: SubscriptionAdapter,
    },
    {
      provide: 'InvoiceAdapterInterface',
      useClass: MpInvoiceAdapter,
    },
    {
      provide: 'MercadopagoSubscriptionPlanAdapterInterface',
      useClass: MercadoPagoSubscriptionPlanAdapter,
    },
    {
      provide: 'MpHandlerValidationsInterface',
      useFactory: (configService: ConfigService, logger: MyLoggerService) => {
        return new MpHandlerValidations(configService, logger);
      },
      inject: [ConfigService, MyLoggerService],
    },
  ],
})
export class WebhookModule {}
