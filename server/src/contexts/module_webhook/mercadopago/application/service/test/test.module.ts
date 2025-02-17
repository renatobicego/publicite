import { getModelToken, MongooseModule } from "@nestjs/mongoose";
import * as dotenv from 'dotenv';
import { Test, TestingModule } from "@nestjs/testing";

import { ContactModule } from "src/contexts/module_user/contact/infrastructure/module/contact.module";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { UserModule } from "src/contexts/module_user/user/infrastructure/module/user.module";
import { ErrorSchema } from "../../../infastructure/schemas/error.schema";
import { InvoiceSchema } from "../../../infastructure/schemas/invoice.schema";
import { PaymentSchema } from "../../../infastructure/schemas/payment.schema";
import { SubscriptionSchema } from "../../../infastructure/schemas/subscription.schema";
import { SubscriptionPlanSchema } from "../../../infastructure/schemas/subscriptionPlan.schema";
import { SubscriptionRepository } from "../../../infastructure/repository/mp-subscription.repository";
import { MercadoPagoSubscriptionPlanService } from "../mp-subscriptionPlan.service";
import { MpSubscriptionService } from "../mp-subscription.service";
import { UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { MercadoPagoSubscriptionPlanRepository } from "../../../infastructure/repository/mp-subscriptionPlan.repository";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { EmmiterModule } from "src/contexts/module_shared/event-emmiter/emiter.module";
import { LoggerModule } from "src/contexts/module_shared/logger/logger.module";
import { UserBusinessModel } from "src/contexts/module_user/user/infrastructure/schemas/userBussiness.schema";
import { UserPersonModel } from "src/contexts/module_user/user/infrastructure/schemas/userPerson.schema";
import { MpHandlerEvents } from "../../../infastructure/adapters/handler/mpHandlerFETCHEvents";
import { MpPaymentService } from "../mp-payment.service";
import { MpInvoiceService } from "../mp-invoice.service";



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

            ]),
            UserModule,
        ],
        providers: [
            MyLoggerService,
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
                provide: 'MpPaymentServiceInterface',
                useValue: {}
            },
            {
                provide: 'ErrorServiceInterface',
                useValue: {}
            },
            {
                provide: 'FetchToMpInterface',
                useValue: {}
            },
            {
                provide: 'MercadoPagoInvoiceRepositoryInterface',
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