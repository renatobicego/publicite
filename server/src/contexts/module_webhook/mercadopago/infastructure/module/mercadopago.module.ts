import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';


import { LoggerModule } from 'src/contexts/module_shared/logger/logger.module';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserModule } from 'src/contexts/module_user/user/infrastructure/module/user.module';
import { WebhookService } from 'src/contexts/module_webhook/clerk/application/clerkWebhook.service';
import { MpHandlerValidations } from 'src/contexts/module_webhook/mercadopago/application/handler/mp.handler.validations';

import { MpInvoiceService } from 'src/contexts/module_webhook/mercadopago/application/service/mp-invoice.service';
import { MpPaymentService } from 'src/contexts/module_webhook/mercadopago/application/service/mp-payment.service';
import { MpSubscriptionService } from 'src/contexts/module_webhook/mercadopago/application/service/mp-subscription.service';
import { MercadoPagoSubscriptionPlanService } from 'src/contexts/module_webhook/mercadopago/application/service/mp-subscriptionPlan.service';
import { MpInvoiceAdapter } from 'src/contexts/module_webhook/mercadopago/infastructure/adapters/in/mp-invoice.adapter';
import { MpPaymentAdapter } from 'src/contexts/module_webhook/mercadopago/infastructure/adapters/in/mp-payment.adapter';
import { SubscriptionAdapter } from 'src/contexts/module_webhook/mercadopago/infastructure/adapters/in/mp-subscription.adapter';
import { MercadoPagoSubscriptionPlanAdapter } from 'src/contexts/module_webhook/mercadopago/infastructure/adapters/in/mp-subscriptionPlan.adapter';
import { MpWebhookAdapter } from 'src/contexts/module_webhook/mercadopago/infastructure/adapters/in/mp-webhook.adapter';
import { SubscriptionController } from 'src/contexts/module_webhook/mercadopago/infastructure/controllers/mp-subscription.controller';
import { MercadopagoSubscriptionPlanController } from 'src/contexts/module_webhook/mercadopago/infastructure/controllers/mp-subscriptionPlan.controller';
import { MpPaymentResolver } from 'src/contexts/module_webhook/mercadopago/infastructure/controllers/resolver/mp-payment.resolver';
import MercadoPagoEventsRepository from '../repository/mp-events.repository';
import { MpInvoiceRepository } from '../repository/mp-invoice.repository';
import { MercadoPagoPaymentsRepository } from '../repository/mp-payments.repository';
import { SubscriptionRepository } from '../repository/mp-subscription.repository';
import { MercadoPagoSubscriptionPlanRepository } from '../repository/mp-subscriptionPlan.repository';
import { InvoiceSchema } from '../schemas/invoice.schema';
import { PaymentSchema } from '../schemas/payment.schema';
import { SubscriptionSchema } from '../schemas/subscription.schema';
import { SubscriptionPlanSchema } from '../schemas/subscriptionPlan.schema';
import { MercadopagoController } from '../controllers/main.controller.mp/mercadopago.controller';
import { MpHandlerEvents } from '../../application/handler/mpHandlerFETCHEvents';
import { FetchToMercadoPagoAdapter } from '../adapters/out/fetch.to.mp';

@Module({
    imports: [
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
        MercadopagoController,
        SubscriptionController,
        MercadopagoSubscriptionPlanController,
    ],
    providers: [
        WebhookService,
        MpWebhookAdapter,
        MpPaymentResolver,
        {
            provide: 'MpHandlerEventsInterface',
            useClass: MpHandlerEvents,
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
            provide: 'MpPaymentAdapterInterface',
            useClass: MpPaymentAdapter,
        },
        {
            provide: 'MercadopagoSubscriptionPlanAdapterInterface',
            useClass: MercadoPagoSubscriptionPlanAdapter,
        },
        // {
        //     provide: 'FetchToMpInterface',
        //     useClass: FetchToMercadoPagoAdapter,
        // },
        {
            provide: 'MpHandlerValidationsInterface',
            useClass: MpHandlerValidations,
        },
        {
            provide: 'MpHandlerValidationsInterface',
            useFactory: (configService: ConfigService, logger: MyLoggerService) => {
                return new MpHandlerValidations(configService, logger);
            },
            inject: [ConfigService, MyLoggerService],
        },
        {
            provide: 'FetchToMpInterface',
            useFactory: (configService: ConfigService, logger: MyLoggerService) => {
                return new FetchToMercadoPagoAdapter(configService, logger);
            },
            inject: [ConfigService, MyLoggerService],
        },
    ],
})
export class MercadoPagoModule { }
