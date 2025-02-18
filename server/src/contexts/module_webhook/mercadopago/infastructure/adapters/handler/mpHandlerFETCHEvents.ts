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
import { payment_notification_events_enum, PaymentDataFromMeli } from '../../../domain/entity/payment.data.meli';
import { Payment as Payment_meli } from '../../../domain/entity_mp/payment';



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

  async create_payment(dataID: string): Promise<boolean> {
    try {

      this.logger.log(
        `PAYMETN STATUS CREATE - BODY RECIVED: ${dataID}`,
      );

      const mercadoPago_paymentResponse: Payment_meli = await this.fetchToMpAdapter.getDataFromMp_fetch(
        `${this.URL_PAYMENT_CHECK}${dataID}`,
      );

      if (!mercadoPago_paymentResponse) {
        this.logger.warn(`Fetch to mercadopago returned an empty response, please try again -> ${this.URL_PAYMENT_CHECK}${dataID}`);
        return Promise.resolve(false);
      }

      console.log('PAYMENT CREATE RESPONSE:');
      console.log(mercadoPago_paymentResponse);



      const is_a_card_validation = await this.is_a_card_validation(mercadoPago_paymentResponse, "payment.created");
      if (is_a_card_validation) return Promise.resolve(true);

      const statusOfThePayment = mercadoPago_paymentResponse.status.toString().toLowerCase();



      if (!this.availableStatusOfTheCreatePayment.includes(statusOfThePayment)) {
        this.logger.error('Unknown payment CREATE status: ' + statusOfThePayment + " payment is not 'approved', 'rejected', 'pending', 'in_process', please verify status of payment");
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
        `PAYMETN STATUS UPDATE - BODY RECIVED: ${dataID}`,
      );

      const mercadoPago_paymentResponse: Payment_meli = await this.fetchToMpAdapter.getDataFromMp_fetch(
        `${this.URL_PAYMENT_CHECK}${dataID}`,
      );

      const is_a_card_validation = await this.is_a_card_validation(mercadoPago_paymentResponse, "paymenty.created");
      if (is_a_card_validation) return Promise.resolve(true);

      const statusOfThePayment = mercadoPago_paymentResponse.status.toString().toLowerCase();

      if (!this.availableStatusOfTheCreatePayment.includes(statusOfThePayment)) {
        this.logger.error('Unknown payment CREATE status: ' + statusOfThePayment + " payment is not 'approved', 'rejected', 'pending', 'in_process', please verify status of payment");
        throw new Error('Unknown payment CREATE status: ' + statusOfThePayment);
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
      console.log('Meli fetch response suscription:');
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
      const subscription_preapproval_update: Subscription_preapproval =
        await this.fetchToMpAdapter.getDataFromMp_fetch(
          `${this.URL_SUBCRIPTION_PREAPPROVAL_CHECK}${dataID}`,
        );
        console.log('Meli fetch response suscription_preapproval_updated:');
      console.log(subscription_preapproval_update);
      const { preapproval_plan_id, reason, status, external_reference } =
        subscription_preapproval_update;

      const data = {
        subscriptionPlanId: preapproval_plan_id,
        reason: reason,
        status: status,
        retryAttemp: 1,
        userId: external_reference,
      }

      await this.make_payment_notification_and_send(data);

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
          const data = {
            subscriptionPlanId: subscription.getSubscriptionPlan(),
            reason: subscription_authorized_payment.reason,
            status: payment.getStatus(),
            retryAttemp: subscription_authorized_payment.retry_attempt,
            userId: subscription_authorized_payment.external_reference,
          }
          await this.make_payment_notification_and_send(data);
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


  private async make_payment_notification_and_send(data: {
    subscriptionPlanId: any,
    reason: string,
    status: string,
    retryAttemp: any,
    userId: string,
  }) {
    try {
      const {
        subscriptionPlanId,
        reason,
        status,
        retryAttemp,
        userId,
      } = data;

      if (!subscriptionPlanId || !reason || !status || !retryAttemp || !userId) {
        this.logger.error('One of the values is missing in the payment notification data. Payment notification not sent.')
        return true
      }
      const paymenStatusMap = new Map<string, payment_notification_events_enum>([
        ['approved', payment_notification_events_enum.payment_approved],
        ['pending', payment_notification_events_enum.payment_pending],
        ['rejected', payment_notification_events_enum.payment_rejected],
        ['cancelled', payment_notification_events_enum.subscription_cancelled],
      ])

      const paymentStatus = data.status;
      const event = paymenStatusMap.get(paymentStatus) ?? payment_notification_events_enum.payment_pending;

      const paymentDataFromMeli: PaymentDataFromMeli = {
        event: event,
        subscriptionPlanId: subscriptionPlanId,
        reason: reason,
        status: paymentStatus,
        retryAttemp: retryAttemp ?? 1,
        userId: userId
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

        //Aca tengo que pausar la suscription
        await this.subscriptionService.changeStatusOfSubscription(response_mp_subscription_authorized_payment.preapproval_id, statusOfSubscription.PAUSED)

        const invoiceUpdated: any = await this.MpInvoiceService.updateInvoice(
          response_mp_subscription_authorized_payment,
          response_mp_subscription_authorized_payment.id
        );
        const userId = response_mp_subscription_authorized_payment.external_reference
        const result = await this.update_plan_user(userId, downgrade_plan_contact);
        if (result) await this.update_plan_user(userId, downgrade_plan_post);

        if (invoiceUpdated) {
          const data = {
            subscriptionPlanId: invoiceUpdated.subscriptionId,
            reason: invoiceUpdated.reason,
            status: paymentStatus,
            retryAttemp: invoiceUpdated.retryAttempts,
            userId: invoiceUpdated.external_reference
          }
          this.make_payment_notification_and_send(data)
        }



        return true
      }



      if (response_mp_subscription_authorized_payment && response_mp_subscription_authorized_payment.retry_attempt && response_mp_subscription_authorized_payment.retry_attempt > 0 && approvedStatuses.has(paymentStatus)) {
        this.logger.warn("This is a retry, we are updating the invoice and returning OK to Meli - The status of the subscription or payment is: " + paymentStatus);
        this.logger.log('status of payment: ' + paymentStatus);
        this.logger.log('Status of subscription:' + subscriptionStatus);

        const invoiceUpdated: any = await this.MpInvoiceService.updateInvoice(
          response_mp_subscription_authorized_payment,
          response_mp_subscription_authorized_payment.id
        )


        if (invoiceUpdated) {
          const data = {
            subscriptionPlanId: invoiceUpdated.subscriptionId,
            reason: invoiceUpdated.reason,
            status: paymentStatus,
            retryAttemp: invoiceUpdated.retryAttempts,
            userId: invoiceUpdated.external_reference
          }
          this.make_payment_notification_and_send(data)
        }
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

      const invoiceUpdated: any = await this.MpInvoiceService.updateInvoice(
        response_mp_subscription_authorized_payment,
        response_mp_subscription_authorized_payment.id
      );
      if (invoiceUpdated) {
        const data = {
          subscriptionPlanId: invoiceUpdated.subscriptionId,
          reason: invoiceUpdated.reason,
          status: paymentStatus,
          retryAttemp: invoiceUpdated.retryAttempts,
          userId: invoiceUpdated.external_reference
        }
        this.make_payment_notification_and_send(data)
      }
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

//Test payment notif
/*
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

  if (testType === 'pending') {
    paymentDataFromMeli = {
      event: payment_notification_events_enum.payment_pending,
      subscriptionPlanId: subscription.subscriptionPlan,
      reason: "Publicite premium",
      status: 'pending',
      retryAttemp: "0",
      userId: userId,
    }
  }

  await this.emmiter.emitAsync(subscription_event, paymentDataFromMeli);


}
  */