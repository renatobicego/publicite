"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const clerkWebhook_service_1 = require("../../application/clerk/clerkWebhook.service");
const clerk_webhook_adapter_1 = require("../adapters/clerk/clerk-webhook.adapter");
const webhook_controller_1 = require("../controllers/webhook.controller");
const mpWebhook_service_1 = require("../../application/mercadopago/mpWebhook.service");
const mp_webhook_adapter_1 = require("../adapters/mercadopago/mp-webhook.adapter");
const subscription_schema_1 = require("../schemas/mercadopago/subscription.schema");
const mongoose_1 = require("@nestjs/mongoose");
const mpHandlerEvents_1 = require("../../application/mercadopago/handler/mpHandlerEvents");
const invoice_schema_1 = require("../schemas/mercadopago/invoice.schema");
const mpEvents_repository_1 = require("../repository/mercadopago/mpEvents.repository");
const payment_schema_1 = require("../schemas/mercadopago/payment.schema");
const subscriptionPlan_schema_1 = require("../schemas/mercadopago/subscriptionPlan.schema");
const subscription_controller_1 = require("../controllers/subscription.controller");
const mp_subscription_adapter_1 = require("../adapters/mercadopago/mp-subscription.adapter");
const mpSubscription_service_1 = require("../../application/mercadopago/mpSubscription.service");
const subscription_repository_1 = require("../repository/mercadopago/subscription.repository");
const logger_service_1 = require("src/contexts/shared/logger/logger.service");
let WebhookModule = class WebhookModule {
};
WebhookModule = __decorate([
    (0, common_1.Module)({
        imports: [
            //UserModule, // Importa el UserModule que posiblemente sea necesario en tu WebhookModule
            config_1.ConfigModule.forRoot(),
            //Definimos los modelos que utilizara el modulo
            mongoose_1.MongooseModule.forFeature([
                { name: 'Subscription', schema: subscription_schema_1.SubscriptionSchema },
                { name: 'Invoice', schema: invoice_schema_1.InvoiceSchema },
                { name: 'Payment', schema: payment_schema_1.PaymentSchema },
                { name: 'SubscriptionPlan', schema: subscriptionPlan_schema_1.SubscriptionPlanSchema },
            ]),
        ],
        controllers: [webhook_controller_1.WebhookController, subscription_controller_1.SubscriptionController],
        providers: [
            // Proveedor para ClerkWebhookAdapter
            {
                provide: clerk_webhook_adapter_1.ClerkWebhookAdapter,
                useFactory: (webhookService, configService) => {
                    const WEBHOOK_SECRET_CLERK = configService.get('WEBHOOK_SECRET_CLERK');
                    if (!WEBHOOK_SECRET_CLERK) {
                        throw new Error('Please add WEBHOOK_SECRET_CLERK to your environment variables');
                    }
                    return new clerk_webhook_adapter_1.ClerkWebhookAdapter(webhookService, WEBHOOK_SECRET_CLERK);
                },
                inject: [clerkWebhook_service_1.WebhookService, config_1.ConfigService], // Inyecta dependencias necesarias
            },
            clerkWebhook_service_1.WebhookService,
            logger_service_1.MyLoggerService,
            mp_webhook_adapter_1.MpWebhookAdapter,
            {
                provide: 'MpWebhookServiceInterface',
                useClass: mpWebhook_service_1.MpWebhookService,
            },
            {
                provide: 'MercadoPagoEventsInterface',
                useClass: mpEvents_repository_1.default,
            },
            {
                provide: 'MpHandlerEventsInterface',
                useClass: mpHandlerEvents_1.MpHandlerEvents,
            },
            {
                provide: 'SubscriptionAdapterInterface',
                useClass: mp_subscription_adapter_1.SubscriptionAdapter,
            },
            {
                provide: 'SubscriptionRepositoryInterface',
                useClass: subscription_repository_1.SubscriptionRepository,
            },
            {
                provide: 'SubscriptionServiceInterface',
                useClass: mpSubscription_service_1.MpSubscriptionService,
            },
        ],
    })
], WebhookModule);
exports.WebhookModule = WebhookModule;
//# sourceMappingURL=webhook.module.js.map