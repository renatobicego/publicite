"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpHandlerEvents = void 0;
const common_1 = require("@nestjs/common");
/*
HandlerEvents de mercadopago:
Esta clase tiene la unica responsabilidad de procesar los eventos de mercadopago, no deberiamos tener otra logica que no se encargue de procesar eventos de webhook MP.
Orquesta la logica de llamadas a la API de meli y comunica con el servicio

*/
let MpHandlerEvents = class MpHandlerEvents {
    constructor(logger, mpWebhookService) {
        this.logger = logger;
        this.mpWebhookService = mpWebhookService;
        //Meli urls
        this.URL_SUBCRIPTION_PREAPPROVAL_CHECK = 'https://api.mercadopago.com/preapproval/';
        this.URL_SUBCRIPTION_AUTHORIZED_CHECK = 'https://api.mercadopago.com/authorized_payments/';
        this.URL_PAYMENT_CHECK = 'https://api.mercadopago.com/v1/payments/';
    }
    async handleEvent_subscription_preapproval(dataID) {
        try {
            const subscription_preapproval = await this.mpWebhookService.fetchData(`${this.URL_SUBCRIPTION_PREAPPROVAL_CHECK}${dataID}`);
            console.log('subscription_preapproval RESPONSE:');
            console.log(subscription_preapproval);
            await this.mpWebhookService.createSubscription_preapproval(subscription_preapproval);
            return Promise.resolve(true);
        }
        catch (error) {
            this.logger.error('An error has ocurred while processing subscription_preapproval event: ' +
                error);
            throw new Error(error);
        }
    }
    async handleEvent_subscription_authorized_payment(dataID) {
        try {
            this.logger.log('The proccess of subscription_authorized_payment are starting - Class:mpHandlerEvents');
            const subscription_authorized_payment = await this.mpWebhookService.fetchData(`${this.URL_SUBCRIPTION_AUTHORIZED_CHECK}${dataID}`);
            console.log('subscription_authorized_payment RESPONSE:');
            console.log(subscription_authorized_payment);
            await this.mpWebhookService.createSubscription_authorize_payment(subscription_authorized_payment);
            return Promise.resolve(true);
        }
        catch (error) {
            this.logger.error('An error has ocurred while processing subscription_authorized_payment event: ' +
                error);
            throw new Error(error);
        }
    }
    async handleEvent_payment(dataID, action) {
        this.logger.log(`The proccess of payment are starting- HANDLE_PAYMENT -> ACTION: ${action} - Class:mpHandlerEvents`);
        try {
            const paymentResponse = await this.mpWebhookService.fetchData(`${this.URL_PAYMENT_CHECK}${dataID}`);
            console.log('PAYMENT RESPONSE:');
            console.log(paymentResponse);
            if (action === 'payment.created' &&
                paymentResponse.operation_type === 'card_validation') {
                // if (paymentResponse.payer.id && paymentResponse.payer.email) {
                //   this.logger.log(
                //     'Setting user payer id: ' +
                //       paymentResponse.payer.id +
                //       'to: ' +
                //       paymentResponse.payer.email,
                //   );
                // }
                // await this.mpWebhookService.setPayerIDtoUser(
                //   paymentResponse.payer.id,
                //   paymentResponse.payer.email,
                // );
                this.logger.log('MpWebhookAdapter - Case paymenty.created - type card_validation, sending response OK to meli & return');
                return Promise.resolve(true);
            }
            await this.mpWebhookService.create_payment(paymentResponse);
            return Promise.resolve(true);
        }
        catch (error) {
            this.logger.error('An error has ocurred while processing payment event: ' + error);
            throw error;
        }
    }
};
MpHandlerEvents = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('MpWebhookServiceInterface'))
], MpHandlerEvents);
exports.MpHandlerEvents = MpHandlerEvents;
/* CRONOLOGIA DE EVENTOS EJEMPLOS*/
//PAYMENT CARD_VALIDATION
/*
{
    "accounts_info": null,
    "acquirer_reconciliation": [],
    "additional_info": {
        "authentication_code": null,
        "available_balance": null,
        "nsu_processadora": null
    },
    "authorization_code": "301299",
    "binary_mode": true,
    "brand_id": null,
    "build_version": "3.66.0-rc-2",
    "call_for_authorize_id": null,
    "captured": true,
    "card": {
        "bin": "50317557",
        "cardholder": {
            "identification": {
                "number": "12345678",
                "type": "DNI"
            },
            "name": "Test Test"
        },
        "country": null,
        "date_created": "2024-08-23T17:16:56.000-04:00",
        "date_last_updated": "2024-08-23T17:16:56.000-04:00",
        "expiration_month": 11,
        "expiration_year": 2025,
        "first_six_digits": "503175",
        "id": null,
        "last_four_digits": "0604",
        "tags": null
    },
    "charges_details": [],
    "collector_id": 1956533506,
    "corporation_id": null,
    "counter_currency": null,
    "coupon_amount": 0,
    "currency_id": "ARS",
    "date_approved": "2024-08-23T17:16:56.000-04:00",
    "date_created": "2024-08-23T17:16:56.000-04:00",
    "date_last_updated": "2024-08-23T17:16:56.000-04:00",
    "date_of_expiration": null,
    "deduction_schema": null,
    "description": "Recurring payment validation",
    "differential_pricing_id": null,
    "external_reference": null,
    "fee_details": [],
    "financing_group": null,
    "id": 86031926816,
    "installments": 1,
    "integrator_id": null,
    "issuer_id": "3",
    "live_mode": true,
    "marketplace_owner": null,
    "merchant_account_id": null,
    "merchant_number": null,
    "metadata": {},
    "money_release_date": null,
    "money_release_schema": null,
    "money_release_status": null,
    "notification_url": null,
    "operation_type": "card_validation",
    "order": {},
    "payer": {
        "email": "test_user_1345316664@testuser.com",
        "entity_type": null,
        "first_name": null,
        "id": "1948475212",
        "identification": {
            "number": "1111111",
            "type": "DNI"
        },
        "last_name": null,
        "operator_id": null,
        "phone": {
            "number": null,
            "extension": null,
            "area_code": null
        },
        "type": null
    },
    "payment_method": {
        "id": "master",
        "issuer_id": "3",
        "type": "credit_card"
    },
    "payment_method_id": "master",
    "payment_type_id": "credit_card",
    "platform_id": null,
    "point_of_interaction": {
        "business_info": {
            "branch": "Merchant Services",
            "sub_unit": "recurring",
            "unit": "online_payments"
        },
        "transaction_data": {},
        "type": "UNSPECIFIED"
    },
    "pos_id": null,
    "processing_mode": "aggregator",
    "refunds": [],
    "release_info": null,
    "shipping_amount": 0,
    "sponsor_id": null,
    "statement_descriptor": "Mercadopago*fake",
    "status": "approved",
    "status_detail": "accredited",
    "store_id": null,
    "tags": null,
    "taxes_amount": 0,
    "transaction_amount": 0,
    "transaction_amount_refunded": 0,
    "transaction_details": {
        "acquirer_reference": null,
        "external_resource_url": null,
        "financial_institution": null,
        "installment_amount": 0,
        "net_received_amount": 0,
        "overpaid_amount": 0,
        "payable_deferral_period": null,
        "payment_method_reference_id": null,
        "total_paid_amount": 0
    }
}
*/
//PRE APPROVAL (SUBSCRIPTION)
/*
{
    "id": "290d32f932264d41b38074269a136bc9",
    "payer_id": 1948475212,
    "payer_email": "",
    "back_url": "https://www.mercadopago.com.ar/subscriptions",
    "collector_id": 1956533506,
    "application_id": 7935091958371220,
    "status": "authorized",
    "reason": "tu wacha",
    "date_created": "2024-08-23T17:16:56.540-04:00",
    "last_modified": "2024-08-23T19:16:14.571-04:00",
    "init_point": "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_id=290d32f932264d41b38074269a136bc9",
    "preapproval_plan_id": "2c9380849174c2cf01917c0d6f3902bb",
    "auto_recurring": {
        "frequency": 1,
        "frequency_type": "months",
        "transaction_amount": 60000.00,
        "currency_id": "ARS",
        "start_date": "2024-08-23T17:16:56.540-04:00",
        "end_date": "2024-09-22T23:00:00.000-04:00",
        "billing_day_proportional": false,
        "has_billing_day": false,
        "free_trial": null
    },
    "summarized": {
        "quotas": 1,
        "charged_quantity": 1,
        "pending_charge_quantity": 0,
        "charged_amount": 60000.00,
        "pending_charge_amount": 0.00,
        "semaphore": "green",
        "last_charged_date": "2024-08-23T18:01:48.231-04:00",
        "last_charged_amount": 60000.00
    },
    "next_payment_date": "2024-09-23T17:16:56.000-04:00",
    "payment_method_id": "master",
    "card_id": "9475683836",
    "payment_method_id_secondary": null,
    "first_invoice_offset": null,
    "subscription_id": "290d32f932264d41b38074269a136bc9"
}
*/
//PAYMENT SCHEDULED
/*
{
    "preapproval_id": "290d32f932264d41b38074269a136bc9",
    "id": 7012376527,
    "type": "recurring",
    "status": "processed",
    "date_created": "2024-08-23T18:01:48.231-04:00",
    "last_modified": "2024-08-23T19:16:14.531-04:00",
    "transaction_amount": 60000.00,
    "currency_id": "ARS",
    "reason": "tu wacha",
    "payment": {
        "id": 85755158103,
        "status": "approved",
        "status_detail": "accredited"
    },
    "retry_attempt": 1,
    "next_retry_date": "2024-09-23T17:16:56.000-04:00",
    "debit_date": "2024-08-23T18:00:15.000-04:00",
    "payment_method_id": "card"
}
*/
// PAYMENT COMPLETE
/*
{
    "accounts_info": null,
    "acquirer_reconciliation": [],
    "additional_info": {
        "authentication_code": null,
        "available_balance": null,
        "nsu_processadora": null
    },
    "authorization_code": "301299",
    "binary_mode": false,
    "brand_id": null,
    "build_version": "3.66.0-rc-2",
    "call_for_authorize_id": null,
    "captured": true,
    "card": {
        "bin": "50317557",
        "cardholder": {
            "identification": {
                "number": "12345678",
                "type": "DNI"
            },
            "name": "Test Test"
        },
        "country": null,
        "date_created": "2024-08-23T19:11:32.000-04:00",
        "date_last_updated": "2024-08-23T19:11:32.000-04:00",
        "expiration_month": 11,
        "expiration_year": 2025,
        "first_six_digits": "503175",
        "id": "9475683836",
        "last_four_digits": "0604",
        "tags": null
    },
    "charges_details": [
        {
            "accounts": {
                "from": "collector",
                "to": "mp"
            },
            "amounts": {
                "original": 2460,
                "refunded": 0
            },
            "client_id": 0,
            "date_created": "2024-08-23T19:11:32.000-04:00",
            "id": "85755158103-001",
            "last_updated": "2024-08-23T19:11:32.000-04:00",
            "metadata": {
                "source": "rule-engine"
            },
            "name": "mercadopago_fee",
            "refund_charges": [],
            "reserve_id": null,
            "type": "fee"
        }
    ],
    "collector_id": 1956533506,
    "corporation_id": null,
    "counter_currency": null,
    "coupon_amount": 0,
    "currency_id": "ARS",
    "date_approved": "2024-08-23T19:11:32.000-04:00",
    "date_created": "2024-08-23T19:11:32.000-04:00",
    "date_last_updated": "2024-08-23T19:11:36.000-04:00",
    "date_of_expiration": null,
    "deduction_schema": null,
    "description": "tu wacha",
    "differential_pricing_id": null,
    "external_reference": null,
    "fee_details": [
        {
            "amount": 2460,
            "fee_payer": "collector",
            "type": "mercadopago_fee"
        }
    ],
    "financing_group": null,
    "id": 85755158103,
    "installments": 1,
    "integrator_id": null,
    "issuer_id": "3",
    "live_mode": true,
    "marketplace_owner": null,
    "merchant_account_id": null,
    "merchant_number": null,
    "metadata": {
        "preapproval_id": "290d32f932264d41b38074269a136bc9"
    },
    "money_release_date": "2024-09-10T19:11:32.000-04:00",
    "money_release_schema": null,
    "money_release_status": "pending",
    "notification_url": null,
    "operation_type": "recurring_payment",
    "order": {},
    "payer": {
        "email": "test_user_1345316664@testuser.com",
        "entity_type": null,
        "first_name": null,
        "id": "1948475212",
        "identification": {
            "number": "1111111",
            "type": "DNI"
        },
        "last_name": null,
        "operator_id": null,
        "phone": {
            "number": null,
            "extension": null,
            "area_code": null
        },
        "type": null
    },
    "payment_method": {
        "data": {
            "routing_data": {
                "merchant_account_id": "5924780738444"
            }
        },
        "id": "master",
        "issuer_id": "3",
        "type": "credit_card"
    },
    "payment_method_id": "master",
    "payment_type_id": "credit_card",
    "platform_id": null,
    "point_of_interaction": {
        "application_data": {
            "name": "recurring",
            "version": "3.23.0-rc-1"
        },
        "business_info": {
            "branch": "Merchant Services",
            "sub_unit": "recurring",
            "unit": "online_payments"
        },
        "transaction_data": {
            "billing_date": "2024-08-23",
            "first_time_use": true,
            "invoice_id": "a77cd92bee614f85938dfc3cab59f087",
            "invoice_period": {
                "period": 1,
                "type": "monthly"
            },
            "payment_reference": null,
            "plan_id": "7f58a1db5eba4144998be3eb855d11b2",
            "processor": null,
            "subscription_id": "290d32f932264d41b38074269a136bc9",
            "subscription_sequence": {
                "number": 1,
                "total": null
            },
            "user_present": null
        },
        "type": "SUBSCRIPTIONS"
    },
    "pos_id": null,
    "processing_mode": "aggregator",
    "refunds": [],
    "release_info": null,
    "shipping_amount": 0,
    "sponsor_id": null,
    "statement_descriptor": "Mercadopago*fake",
    "status": "approved",
    "status_detail": "accredited",
    "store_id": null,
    "tags": null,
    "taxes_amount": 0,
    "transaction_amount": 60000,
    "transaction_amount_refunded": 0,
    "transaction_details": {
        "acquirer_reference": null,
        "external_resource_url": null,
        "financial_institution": null,
        "installment_amount": 60000,
        "net_received_amount": 57540,
        "overpaid_amount": 0,
        "payable_deferral_period": null,
        "payment_method_reference_id": null,
        "total_paid_amount": 60000
    }
}
*/
// AUTHORIZED PAYMENT (INVOICE)
/*
{
    "preapproval_id": "290d32f932264d41b38074269a136bc9",
    "id": 7012376527,
    "type": "recurring",
    "status": "processed",
    "date_created": "2024-08-23T18:01:48.231-04:00",
    "last_modified": "2024-08-23T19:16:14.531-04:00",
    "transaction_amount": 60000.00,
    "currency_id": "ARS",
    "reason": "tu wacha",
    "payment": {
        "id": 85755158103,
        "status": "approved",
        "status_detail": "accredited"
    },
    "retry_attempt": 1,
    "next_retry_date": "2024-09-23T17:16:56.000-04:00",
    "debit_date": "2024-08-23T18:00:15.000-04:00",
    "payment_method_id": "card"
}
*/
//# sourceMappingURL=mpHandlerEvents.js.map