import { getModelToken, MongooseModule } from "@nestjs/mongoose";
import * as dotenv from 'dotenv';
import { Test, TestingModule } from "@nestjs/testing";
import { EventEmitterModule } from "@nestjs/event-emitter";


import { ContactModule } from "src/contexts/module_user/contact/infrastructure/module/contact.module";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { UserModule } from "src/contexts/module_user/user/infrastructure/module/user.module";

import { EmmiterModule } from "src/contexts/module_shared/event-emmiter/emiter.module";
import { LoggerModule } from "src/contexts/module_shared/logger/logger.module";
import { UserBusinessModel } from "src/contexts/module_user/user/infrastructure/schemas/userBussiness.schema";
import { UserPersonModel } from "src/contexts/module_user/user/infrastructure/schemas/userPerson.schema";
import { UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { MpInvoiceService } from "../application/service/mp-invoice.service";
import { MpPaymentService } from "../application/service/mp-payment.service";
import { MpSubscriptionService } from "../application/service/mp-subscription.service";
import { MercadoPagoSubscriptionPlanService } from "../application/service/mp-subscriptionPlan.service";
import { MpHandlerEvents } from "../infastructure/adapters/handler/mpHandlerFETCHEvents";
import { MercadoPagoPaymentsRepository } from "../infastructure/repository/mp-payments.repository";
import { SubscriptionRepository } from "../infastructure/repository/mp-subscription.repository";
import { MercadoPagoSubscriptionPlanRepository } from "../infastructure/repository/mp-subscriptionPlan.repository";
import { ErrorSchema } from "../infastructure/schemas/error.schema";
import { InvoiceSchema } from "../infastructure/schemas/invoice.schema";
import { PaymentSchema } from "../infastructure/schemas/payment.schema";
import { SubscriptionSchema } from "../infastructure/schemas/subscription.schema";
import { SubscriptionPlanSchema } from "../infastructure/schemas/subscriptionPlan.schema";
import { MpInvoiceRepository } from "../infastructure/repository/mp-invoice.repository";
import NotificationModel from "src/contexts/module_user/notification/infrastructure/schemas/notification.schema";
import { PaymentNotificationService } from "../infastructure/adapters/handler/PaymentNotificationService";
import { ErrorService } from "../application/service/error/error.service.interface";
import { ErrorRepository } from "../infastructure/repository/error/error.repository";




const mercadopago_testing_module = async (): Promise<TestingModule> => {
    dotenv.config({ path: '.env.test' });
    const uri = process.env.DATABASE_URI;

    return Test.createTestingModule({
        imports: [
            ContactModule,
            LoggerModule,
            EventEmitterModule.forRoot(
            ),
            EmmiterModule,
            MongooseModule.forRootAsync({
                useFactory: async () => {
                    return {
                        uri: uri,
                    };
                },
            }),
            MongooseModule.forFeature([
                { name: 'Subscription', schema: SubscriptionSchema },
                { name: UserModel.modelName, schema: UserModel.schema },
                { name: 'Invoice', schema: InvoiceSchema },
                { name: 'Payment', schema: PaymentSchema },
                { name: 'SubscriptionPlan', schema: SubscriptionPlanSchema },
                { name: 'Error', schema: ErrorSchema },
                { name: NotificationModel.modelName, schema: NotificationModel.schema },

            ]),
            UserModule,
        ],
        providers: [
            MyLoggerService,
            PaymentNotificationService,
            {
                provide: 'SubscriptionRepositoryInterface',
                useClass: SubscriptionRepository,
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
                provide: 'MercadoPagoSubscriptionPlanRepositoryInterface',
                useClass: MercadoPagoSubscriptionPlanRepository,
            },
            {
                provide: 'MpHandlerEventsInterface',
                useClass: MpHandlerEvents,
            },
            {
                provide: 'MpServiceInvoiceInterface',
                useClass: MpInvoiceService,
            },
            {
                provide: 'MercadoPagoInvoiceRepositoryInterface',
                useClass: MpInvoiceRepository,
            },
            {
                provide: 'MpPaymentServiceInterface',
                useClass: MpPaymentService,
            },
            {
                provide: 'MercadoPagoPaymentsRepositoryInterface',
                useClass: MercadoPagoPaymentsRepository
            },
            {
                provide: 'ErrorServiceInterface',
                useClass: ErrorService,
            },
            {
                provide: 'ErrorRepositoryInterface',
                useClass: ErrorRepository,
            },
            {
                provide: 'FetchToMpInterface',
                useValue: {}
            },


            { provide: getModelToken(UserPersonModel.modelName), useValue: {} },
            { provide: getModelToken(UserBusinessModel.modelName), useValue: {} },
        ],
    }).compile();
};


const mpTestingModule: Map<string, any> = new Map([
    ["mp_testing_module", mercadopago_testing_module],

]);

export default mpTestingModule;