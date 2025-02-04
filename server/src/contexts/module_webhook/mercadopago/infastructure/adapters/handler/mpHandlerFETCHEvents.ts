import { Inject, Injectable } from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { MpHandlerEventsInterface } from 'src/contexts/module_webhook/mercadopago/domain/handler/mp.handler.events.interface';
import { FetchToMpInterface } from '../../../application/adapter/out/fech.to.mp.interface';
import { MpServiceInvoiceInterface } from '../../../domain/service/mp-invoice.service.interface';
import { MpPaymentServiceInterface } from '../../../domain/service/mp-payments.service.interface';
import { statusOfSubscription, SubscriptionServiceInterface } from '../../../domain/service/mp-subscription.service.interface';
import { downgrade_plan_contact, downgrade_plan_post, subscription_event } from 'src/contexts/module_shared/event-emmiter/events';
import { authorized_payments, } from '../../../domain/entity_mp/authorized_payments';
import { Subscription_preapproval } from '../../../domain/entity_mp/subscription_preapproval';

import { ErrorServiceInterface } from '../../../domain/service/error/error.service.interface';
import { EmitterService } from 'src/contexts/module_shared/event-emmiter/emmiter';
import Subscription from '../../../domain/entity/subcription.entity';
import { payment_notification_events_enum, PaymentDataFromMeli } from '../../../domain/entity/payment.data.meli';
import { Payment as Payment_meli } from '../../../domain/entity_mp/payment';
import Payment from '../../../domain/entity/payment.entity';



/*
HandlerEvents de mercadopago: 
Esta clase tiene la unica responsabilidad de procesar los eventos de mercadopago, no deberiamos tener otra logica que no se encargue de procesar eventos de webhook MP.
Orquesta la logica de llamadas a la API de meli y comunica con el servicio 


  pending: El usuario aún no ha completado el proceso de pago 
          (por ejemplo, después de generar un boleto, el pago se completará cuando el usuario pague en el lugar seleccionado).
  approved: El pago ha sido aprobado y acreditado con éxito.
  authorized: El pago ha sido autorizado pero aún no se ha capturado.
  in_process: El pago está en proceso de revisión.
  in_mediation: El usuario ha iniciado una disputa.
  rejected: El pago fue rechazado (el usuario puede intentar pagar nuevamente).
  cancelled: El pago fue cancelado por alguna de las partes o caducó.
  refunded: El pago fue reembolsado al usuario.
  charged_back: Se realizó un contracargo en la tarjeta de crédito del comprador.

*/



@Injectable()
export class MpHandlerEvents implements MpHandlerEventsInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('MpServiceInvoiceInterface')
    private readonly MpInvoiceService: MpServiceInvoiceInterface,
    @Inject('MpPaymentServiceInterface')
    private readonly mpPaymentService: MpPaymentServiceInterface,
    @Inject('SubscriptionServiceInterface')
    private readonly subscriptionService: SubscriptionServiceInterface,
    @Inject('ErrorServiceInterface')
    private readonly errorService: ErrorServiceInterface,
    @Inject('FetchToMpInterface')
    private readonly fetchToMpAdapter: FetchToMpInterface,
    private readonly emmiter: EmitterService

  ) { }

  private availableStatusOfTheCreatePayment = ['approved', 'rejected', 'pending', 'in_process'];
  private availableStatusOfTheUpdatePayment = ['approved', 'rejected', 'pending', 'in_process', 'cancelled'];

  //Meli urls
  private readonly URL_SUBCRIPTION_PREAPPROVAL_CHECK =
    'https://api.mercadopago.com/preapproval/';
  private readonly URL_SUBCRIPTION_AUTHORIZED_CHECK: string =
    'https://api.mercadopago.com/authorized_payments/';
  private readonly URL_PAYMENT_CHECK: string =
    'https://api.mercadopago.com/v1/payments/';

  async check_status_of_the_payment_and_create(dataID: string): Promise<boolean> {
    try {

      this.logger.log(
        `The proccess of payment are starting- PAYMENT.CREATE ARE RECEIVED: ${dataID}`,
      );
      this.logger.log(`Fetching to Mercadopago....`);
      const mercadoPago_paymentResponse: Payment_meli = await this.fetchToMpAdapter.getDataFromMp_fetch(
        `${this.URL_PAYMENT_CHECK}${dataID}`,
      );

      if (!mercadoPago_paymentResponse) return Promise.resolve(false);

      console.log('PAYMENT CREATE RESPONSE:');
      console.log(mercadoPago_paymentResponse);



      const is_a_card_validation = await this.is_a_card_validation(mercadoPago_paymentResponse, "paymenty.created");
      if (is_a_card_validation) return Promise.resolve(true);

      const statusOfThePayment = mercadoPago_paymentResponse.status.toString().toLowerCase();



      if (!this.availableStatusOfTheCreatePayment.includes(statusOfThePayment)) {
        this.logger.error('Unknown payment CREATE status: ' + statusOfThePayment);
        throw new Error('Unknown payment CREATE status: ' + statusOfThePayment);
      }

      this.logger.log(`MpWebhookAdapter - Case paymenty.created - STATUS: ${statusOfThePayment}`);

      await this.mpPaymentService.createPayment(mercadoPago_paymentResponse);
      return Promise.resolve(true);
    } catch (error: any) {
      this.logger.error('An error has ocurred while processing payment event: ' + error);
      throw error;
    }
  }
  async update_payment(dataID: string): Promise<boolean> {
    try {
      this.logger.log(
        `The proccess of payment are starting- PAYMENT.UPDATE ARE RECEIVED: ${dataID}`,
      );

      this.logger.log(`Fetching to Mercadopago....`);
      const mercadoPago_paymentResponse: Payment_meli = await this.fetchToMpAdapter.getDataFromMp_fetch(
        `${this.URL_PAYMENT_CHECK}${dataID}`,
      );

      const is_a_card_validation = await this.is_a_card_validation(mercadoPago_paymentResponse, "paymenty.created");
      if (is_a_card_validation) return Promise.resolve(true);

      const statusOfThePayment = mercadoPago_paymentResponse.status.toString().toLowerCase();

      if (!this.availableStatusOfTheUpdatePayment.includes(statusOfThePayment)) {
        this.logger.error('Unknown payment UPDATE status: ' + statusOfThePayment);
        throw new Error('Unknown payment UPDATE status: ' + statusOfThePayment);
      }

      console.log('PAYMENT UPDATE RESPONSE:');
      console.log(mercadoPago_paymentResponse);

      this.logger.log(`MpWebhookAdapter - Case paymenty.UPDATE - STATUS: ${statusOfThePayment}`);


      await this.mpPaymentService.updatePayment(mercadoPago_paymentResponse);
      return Promise.resolve(true);
    } catch (error: any) {
      this.logger.error('An error has ocurred while processing payment event: ' + error);
      throw error;
    }


  }





  async create_subscription_preapproval(
    dataID: string,
  ): Promise<boolean> {
    try {
      /*----------------------------------- FETCH TO MERCADOPAGO SUBSCRIPTION_PREAPPROVAL (CREACION DE SUSCRIPCION)------------------------------ */
      const subscription_preapproval: Subscription_preapproval = await this.fetchToMpAdapter.getDataFromMp_fetch(
        `${this.URL_SUBCRIPTION_PREAPPROVAL_CHECK}${dataID}`,

      );
      console.log('subscription_preapproval RESPONSE:');
      console.log(subscription_preapproval);

      await this.subscriptionService.createSubscription_preapproval(
        subscription_preapproval,
      );
      return Promise.resolve(true);
    } catch (error: any) {
      this.logger.error(
        'An error has ocurred while processing subscription_preapproval event: ' +
        error,
      );
      throw new Error(error);
    }
  }

  async update_subscription_preapproval(
    dataID: string,
  ): Promise<boolean> {
    this.logger.log('handleEvent_subscription_preapproval_updated');
    try {
      /*----------------------------------- FETCH TO MERCADOPAGO SUBSCRIPTION_PREAPPROVAL (ACTUALIZACION DE SUSCRIPCION)------------------------------ */
      const subscription_preapproval_update =
        await this.fetchToMpAdapter.getDataFromMp_fetch(
          `${this.URL_SUBCRIPTION_PREAPPROVAL_CHECK}${dataID}`,
        );
      console.log('subscription_preapproval_update RESPONSE:');
      console.log(subscription_preapproval_update);


      await this.subscriptionService.updateSubscription_preapproval(
        subscription_preapproval_update,
      );
      return Promise.resolve(true);
    } catch (error: any) {
      this.logger.error(
        'An error has ocurred while processing subscription_preapproval_updated event: ' +
        error,
      );
      throw new Error(error);
    }
  }

  async create_subscription_authorized_payment(
    dataID: string,
  ): Promise<boolean> {
    try {
      this.logger.log(
        'The proccess of subscription_authorized_payment (CREATED) are starting - Class:mpHandlerEvents',
      );

      const subscription_authorized_payment: authorized_payments =
        await this.fetchToMpAdapter.getDataFromMp_fetch(
          `${this.URL_SUBCRIPTION_AUTHORIZED_CHECK}${dataID}`,
        );

      console.log('subscription_authorized_payment CREATE RESPONSE:');
      console.log(subscription_authorized_payment);

      if (subscription_authorized_payment.transaction_amount < 30) {
        this.logger.warn(
          'Payment amount is less than $30, returning OK to Meli',
        );
        return Promise.resolve(true);
      }
      const resultOfInvoice = await this.MpInvoiceService.saveInvoice(
        subscription_authorized_payment,
      );

      if (resultOfInvoice != null && resultOfInvoice.paymentReady) {
        const { payment, subscription, paymentReady } = resultOfInvoice;
        if (paymentReady) {
          await this.make_payment_notification_and_send(payment, subscription, subscription_authorized_payment);
        }
      }

      return Promise.resolve(true);
    } catch (error: any) {
      this.logger.error(
        'An error has ocurred while processing subscription_authorized_payment event: ' +
        error,
      );
      throw new Error(error);
    }
  }
  async test_payment_notif(testType: string, userId: string) {
    const subscription = {
      subscriptionPlan: "66c49508e80296e90ec637d8"
    }

    let paymentDataFromMeli: PaymentDataFromMeli = {
      event: payment_notification_events_enum.payment_approved,
      subscriptionPlanId: subscription.subscriptionPlan,
      reason: "Publicite premium",
      status: 'approved',
      retryAttemp: "0",
      userId: userId,
    }

    if (testType === 'rejected') {
      paymentDataFromMeli = {
        event: payment_notification_events_enum.payment_rejected,
        subscriptionPlanId: subscription.subscriptionPlan,
        reason: "Publicite premium",
        status: 'rejected',
        retryAttemp: "2",
        userId: userId,
      }
    }

    await this.emmiter.emitAsync(subscription_event, paymentDataFromMeli);


  }

  private async make_payment_notification_and_send(payment: Payment, subscription: Subscription, subscription_authorized_payment: authorized_payments) {
    try {
      const paymentStatus = payment.getStatus();
      let event = paymentStatus == "approved" ? payment_notification_events_enum.payment_approved : payment_notification_events_enum.payment_rejected;
      const paymentDataFromMeli: PaymentDataFromMeli = {
        event: event ?? payment_notification_events_enum.payment_pending,
        subscriptionPlanId: subscription.getSubscriptionPlan(),
        reason: payment.getDescriptionOfPayment(),
        status: paymentStatus,
        retryAttemp: subscription_authorized_payment.retry_attempt ?? 0,
        userId: payment.getExternalReference(),
      }

      await this.emmiter.emitAsync(subscription_event, paymentDataFromMeli);

    } catch (error: any) {
      throw error;
    }

  }

  async update_subscription_authorized_payment(
    dataID: string,
  ): Promise<boolean> {
    try {
      this.logger.log(
        'The proccess of subscription_authorized_payment (UPDATED) are starting - Class:mpHandlerEvents',
      );


      const rejectedStatuses = new Set(['rejected', 'cancelled']);
      const approvedStatuses = new Set(['approved', 'accredited']);
      const response_mp_subscription_authorized_payment: authorized_payments =
        await this.fetchToMpAdapter.getDataFromMp_fetch(
          `${this.URL_SUBCRIPTION_AUTHORIZED_CHECK}${dataID}`,
        );


      console.log('subscription_authorized_payment UPDATE RESPONSE:');
      console.log(response_mp_subscription_authorized_payment);
      if (!response_mp_subscription_authorized_payment) {
        this.logger.warn(
          'subscription_authorized_payment is null, returning OK to Meli, please check suscription_authorized_payment ID:' +
          dataID,
        );
        return true;
      }


      if (response_mp_subscription_authorized_payment.transaction_amount < 30) {
        this.logger.warn(
          'Payment amount is less than $30, returning OK to Meli',
        );
        return true;
      }


      const paymentStatus =
        response_mp_subscription_authorized_payment.payment?.status.toLowerCase();
      const subscriptionStatus =
        response_mp_subscription_authorized_payment.status.toLowerCase();



      if (rejectedStatuses.has(subscriptionStatus) || rejectedStatuses.has(paymentStatus)) {
        this.logger.warn(
          `Status is rejected, returning OK to Meli and pausing the subscription. Preapproval_id: ${response_mp_subscription_authorized_payment.preapproval_id}`,
        );

        //const isThisSubscriptionWasPaused = await this.subscriptionService.verifyIfSubscriptionWasPused(response_mp_subscription_authorized_payment.preapproval_id)

        //Aca tengo que pausar la suscription
        await this.subscriptionService.changeStatusOfSubscription(response_mp_subscription_authorized_payment.preapproval_id, statusOfSubscription.PAUSED)

        await this.MpInvoiceService.updateInvoice(
          response_mp_subscription_authorized_payment,
          response_mp_subscription_authorized_payment.id
        );
        const userId = response_mp_subscription_authorized_payment.external_reference
        const result = await this.update_plan_user(userId, downgrade_plan_contact);
        if (result) await this.update_plan_user(userId, downgrade_plan_post);



        // if (isThisSubscriptionWasPaused) {
        //   return true;
        // } else {
        //   await this.fetchToMpAdapter.changeSubscriptionStatusInMercadopago_fetch(
        //     this.URL_SUBCRIPTION_PREAPPROVAL_CHECK,
        //     response_mp_subscription_authorized_payment.preapproval_id,
        //     'paused',
        //   );
        //   return true;
        // }
        return true
      }



      if (response_mp_subscription_authorized_payment && response_mp_subscription_authorized_payment.retry_attempt && response_mp_subscription_authorized_payment.retry_attempt > 0 && approvedStatuses.has(paymentStatus)) {
        this.logger.warn("This is a retry, we are updating the invoice and returning OK to Meli - The status of the subscription or payment is: " + paymentStatus);
        this.logger.log('status of payment: ' + paymentStatus);
        this.logger.log('Status of subscription:' + subscriptionStatus);

        await this.MpInvoiceService.updateInvoice(
          response_mp_subscription_authorized_payment,
          response_mp_subscription_authorized_payment.id
        )


        //Aca tengo que poner la suscripcion como authorized
        const isThisSubscriptionWasPaused = await this.subscriptionService.verifyIfSubscriptionWasPused(response_mp_subscription_authorized_payment.preapproval_id)

        if (isThisSubscriptionWasPaused && (approvedStatuses.has(subscriptionStatus) || approvedStatuses.has(paymentStatus))) {
          this.logger.warn(
            `Status was paused, changing to new status. Preapproval_id: ${response_mp_subscription_authorized_payment.preapproval_id}`,
          );
          this.logger.warn(
            `Status of payment: ${paymentStatus}`,
          );
          this.logger.warn(
            `Status of subscription: ${subscriptionStatus}`,
          );
          this.logger.warn(
            `Changing subscription status in mercadopago...`,
          );

          await this.subscriptionService.changeStatusOfSubscription(response_mp_subscription_authorized_payment.preapproval_id, statusOfSubscription.AUTHORIZED)
          // await this.fetchToMpAdapter.changeSubscriptionStatusInMercadopago_fetch(
          //   this.URL_SUBCRIPTION_PREAPPROVAL_CHECK,
          //   response_mp_subscription_authorized_payment.preapproval_id,
          //   'authorized',
          // );



          this.logger.warn(
            `Change subscription status in mercadopago Succesfully -- NEW STATUS PAYMENT: ${paymentStatus} -- NEW STATUS SUBSCRIPTION: ${subscriptionStatus}`,
          );
          return true
        }
        return true
      }


      this.logger.log('Updating subscription_authorized_payment...');
      await this.MpInvoiceService.updateInvoice(
        response_mp_subscription_authorized_payment,
        response_mp_subscription_authorized_payment.id
      );
      return true;
    } catch (error: any) {
      this.logger.error(
        'An error has ocurred while processing subscription_authorized_payment event: ' +
        error,
      );
      throw error;
    }
  }

  async update_plan_user(user_id: any, event: string): Promise<boolean> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await this.emmiter.emitAsync(event, user_id);

        if (result && result[0] === true) {
          return true;
        } else {
          console.warn(`Intento ${attempt} fallido para actualizar el plan del usuario.`);
        }
      } catch (error: any) {
        console.error(`Error en intento ${attempt}:`, error);

        if (attempt === MAX_RETRIES) {
          const errorBody = {
            code: "4545",
            message: "No se pudo actualizar el plan del usuario luego de múltiples intentos",
            result: error,
            event: event
          };

          await this.create_error_schema(user_id, errorBody);
          this.logger.error(`CODIGO DE ERROR: 4545 PARA EL USUARIO: ${user_id}`);
          throw new Error('No se pudo actualizar el plan del usuario después de múltiples intentos.');
        }
      }

      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }

    // Si llegamos aquí, significa que todos los intentos fallaron
    const errorBody = {
      code: "4545",
      message: "No se pudo actualizar el plan del usuario luego de múltiples intentos",
      result: 'No se pudo actualizar el plan del usuario luego de múltiples intentos',
      event: event
    };

    await this.create_error_schema(user_id, errorBody);
    this.logger.error(`CODIGO DE ERROR: 4545 PARA EL USUARIO: ${user_id}`);
    throw new Error('No se pudo actualizar el plan del usuario después de múltiples intentos.');
  }




  async create_error_schema(user: string, body: any) {
    try {
      console.log(body)

      await this.errorService.createNewError(user, body);
    } catch (error: any) {
      throw error;
    }
  }








  is_a_card_validation(mercado_pago_response: any, type: string): Promise<boolean> {

    if (mercado_pago_response.operation_type === 'card_validation') {
      this.logger.warn(
        `MpWebhookAdapter - Case ${type} - type card_validation, sending response OK to meli & return`,
      );
      return Promise.resolve(true);
    }

    if (mercado_pago_response.transaction_amount < 30) {
      this.logger.warn('Payment amount is less than $50 is a card validation, returning OK to Meli');
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }


}




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
    "preapproval_id": "c6c2978a41e2406ab32b529bc8bf510d",
    "id": 7012805572,
    "type": "recurring",
    "status": "scheduled",
    "date_created": "2024-09-12T09:01:52.993-04:00",
    "last_modified": "2024-09-12T10:07:20.671-04:00",
    "transaction_amount": 15.00,
    "currency_id": "ARS",
    "reason": "publicite_Maxi",
    "external_reference": "TEST_PAGO_SIN_FONDOS_2",
    "payment": {
        "id": 87681460322,
        "status": "in_process",
        "status_detail": "offline_process"
    },
    "rejection_code": "offline_process",
    "retry_attempt": 1,
    "next_retry_date": "2024-09-13T08:43:21.000-04:00",
    "debit_date": "2024-09-12T09:00:11.000-04:00",
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
