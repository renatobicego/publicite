import { Inject, Injectable } from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { MpHandlerEventsInterface } from 'src/contexts/module_webhook/mercadopago/domain/handler/mp.handler.events.interface';
import { FetchToMpInterface } from '../../../application/adapter/out/fech.to.mp.interface';
import { MpServiceInvoiceInterface } from '../../../domain/service/mp-invoice.service.interface';
import { MpPaymentServiceInterface } from '../../../domain/service/mp-payments.service.interface';
import { statusOfSubscription, SubscriptionServiceInterface } from '../../../domain/service/mp-subscription.service.interface';
import { downgrade_plan_contact, downgrade_plan_post } from 'src/contexts/module_shared/event-emmiter/events';
import { authorized_payments, } from '../../../domain/entity_mp/authorized_payments';
import { Subscription_preapproval } from '../../../domain/entity_mp/subscription_preapproval';

import { ErrorServiceInterface } from '../../../domain/service/error/error.service.interface';

import { Payment as Payment_meli } from '../../../domain/entity_mp/payment';

import { EmitterService } from 'src/contexts/module_shared/event-emmiter/emmiter';
import { PaymentNotificationService } from './PaymentNotificationService';
import { resolveExternalReference } from 'src/contexts/module_shared/subscriptions/external-reference';



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
    private readonly mpInvoiceService: MpServiceInvoiceInterface,
    @Inject('MpPaymentServiceInterface')
    private readonly mpPaymentService: MpPaymentServiceInterface,
    @Inject('SubscriptionServiceInterface')
    private readonly subscriptionService: SubscriptionServiceInterface,
    @Inject('ErrorServiceInterface')
    private readonly errorService: ErrorServiceInterface,
    @Inject('FetchToMpInterface')
    private readonly fetchToMpAdapter: FetchToMpInterface,
    private readonly paymentNotificationService: PaymentNotificationService,
    private readonly emmiter: EmitterService

  ) { }
  get getLogger() {
    return this.logger
  }
  get getURL_PAYMENT_CHECK() {
    return this.URL_PAYMENT_CHECK
  }
  private availableStatusOfTheCreatePayment = ['approved', 'rejected', 'pending', 'in_process'];
  private availableStatusOfTheUpdatePayment = [
    'approved',
    'rejected',
    'pending',
    'in_process',
    'cancelled',
    'refunded',
    'charged_back',
    'in_mediation',
  ];

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
        // Tirar error hacía que Meli reintentara el evento sin fin. Se deja constancia y se responde OK.
        this.logger.warn('Unknown payment CREATE status: ' + statusOfThePayment + " payment is not 'approved', 'rejected', 'pending', 'in_process'. Payment ID: " + dataID + ". Nothing to do, returning OK to Meli");
        return Promise.resolve(true);
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

      /*
      Antes se validaba con la lista del CREATE: una devolución (refunded), un
      contracargo o una cancelación respondían 500 y Meli reintentaba sin fin.
      Esos estados se guardan; uno desconocido se registra y se responde OK.
      */
      if (!this.availableStatusOfTheUpdatePayment.includes(statusOfThePayment)) {
        this.logger.warn('Unknown payment UPDATE status: ' + statusOfThePayment + '. Payment ID: ' + dataID + '. Nothing to do, returning OK to Meli');
        return Promise.resolve(true);
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

      await this.registerSubscription(subscription_preapproval);
      return Promise.resolve(true);
    } catch (error: any) {
      this.logger.error(
        'An error has ocurred while processing subscription_preapproval event: ' +
        error,
      );
      throw new Error(error);
    }
  }

  /*
  Alta de la suscripción en nuestra base a partir del preapproval de Meli.
  Lo comparten el evento "created" y el "updated" sin alta previa (ver
  update_subscription_preapproval): en producción Meli no está mandando el
  "created", así que el primer aviso que recibimos de una suscripción nueva
  suele ser un "updated".
  */
  private async registerSubscription(
    subscription_preapproval: Subscription_preapproval,
  ): Promise<void> {
    const reference = resolveExternalReference(
      subscription_preapproval?.external_reference,
    );
    if (reference.type !== 'user') {
      /*
      Regalos, Hacete Amigo y pruebas (`gift:`, `friendGroup:`, `mptest:`) tienen
      su propio alta. Tratarlos como la suscripción de un usuario terminaba en
      "Plan not found" y Meli reintentaba el evento sin fin.
      */
      this.logger.warn(
        `Preapproval ${subscription_preapproval?.id} con external_reference "${subscription_preapproval?.external_reference}" (${reference.type}): no es la suscripción de un usuario, no se registra acá.`,
      );
      return;
    }

    const existing = await this.subscriptionService.findSubscriptionByPreapprovalId(
      subscription_preapproval.id,
    );
    await this.subscriptionService.createSubscription_preapproval(
      subscription_preapproval,
    );

    // El aviso de prueba gratis sale una sola vez: si el checkout ya la había
    // registrado, el aviso lo mandó él.
    const free_trial = subscription_preapproval.auto_recurring?.free_trial;
    if (free_trial && !existing) {
      this.logger.log("Sending free trial payment notification");
      await this.sendFreeTrialPaymentNotification(subscription_preapproval);
    }
  }


  async sendFreeTrialPaymentNotification(subscription_preapproval: Subscription_preapproval) {
    let { preapproval_plan_id, reason, external_reference } =
      subscription_preapproval;

    const data = {
      subscriptionPlanId: preapproval_plan_id,
      reason: reason,
      status: "free_trial",
      retryAttemp: 1,
      userId: external_reference,
    }

    await this.notifySafely(data);
  }

  private async notifyInvoice(invoiceUpdated: any, paymentStatus: string): Promise<void> {
    if (!invoiceUpdated) return;
    await this.notifySafely({
      subscriptionPlanId: invoiceUpdated.subscriptionId,
      reason: invoiceUpdated.reason,
      status: paymentStatus,
      retryAttemp: invoiceUpdated.retryAttempts,
      userId: invoiceUpdated.external_reference,
    });
  }

  /*
  Manda el aviso de pago al usuario y espera a que termine: en Firebase Functions
  lo que no se espera se corta al responder. Un aviso que falla nunca corta el
  procesamiento del evento (el pago o el alta ya se guardaron).
  */
  private async notifySafely(data: any): Promise<void> {
    try {
      await this.paymentNotificationService.sendPaymentNotification(data);
    } catch (error: any) {
      this.logger.error(
        'No se pudo enviar la notificación de pago: ' + (error?.message ?? error),
      );
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

      const { id, status } = subscription_preapproval_update;
      const alreadyRegistered =
        await this.subscriptionService.findSubscriptionByPreapprovalId(id);

      if (!alreadyRegistered) {
        if (status === 'cancelled') {
          // Nunca registramos el alta y Meli ya la dio de baja: no hay nada que
          // cancelar. Se responde OK para que Meli deje de reintentar el evento.
          this.logger.warn(
            `Llegó la cancelación de la suscripción ${id} pero nunca se registró su alta. No hay nada que cancelar.`,
          );
          return Promise.resolve(true);
        }
        this.logger.warn(
          `Llegó un "updated" (${status}) de la suscripción ${id} sin alta previa (Meli no mandó el "created"). Se registra la suscripción desde este evento.`,
        );
        await this.registerSubscription(subscription_preapproval_update);
        return Promise.resolve(true);
      }

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

      const isCardValidation = await this.is_a_card_validation(subscription_authorized_payment, "subscription_authorized_payment.created");
      if (isCardValidation) return Promise.resolve(true);

      const resultOfInvoice = await this.mpInvoiceService.saveInvoice(
        subscription_authorized_payment,
      );

      if (resultOfInvoice != null && resultOfInvoice.paymentReady) {
        const { payment, subscription, paymentReady } = resultOfInvoice;
        if (paymentReady) {
          const data = {
            subscriptionPlanId: subscription.subscriptionPlan,
            reason: subscription_authorized_payment.reason,
            status: payment.status,
            retryAttemp: subscription_authorized_payment.retry_attempt,
            userId: subscription_authorized_payment.external_reference,
          }
          await this.notifySafely(data);
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


      const isCardValidation = await this.is_a_card_validation(response_mp_subscription_authorized_payment, 'UPDATE');
      if (isCardValidation) return Promise.resolve(true);




      const paymentStatus =
        response_mp_subscription_authorized_payment.payment?.status.toLowerCase();
      const subscriptionStatus =
        response_mp_subscription_authorized_payment.status.toLowerCase();



      if (rejectedStatuses.has(subscriptionStatus) || rejectedStatuses.has(paymentStatus)) {
        this.logger.warn(
          `Status is rejected, returning OK to Meli and pausing the subscription. Preapproval_id: ${response_mp_subscription_authorized_payment.preapproval_id}`,
        );

        //Aca tengo que pausar la suscription
        await this.pause_subscription_if_exists(
          response_mp_subscription_authorized_payment.preapproval_id,
        );

        const invoiceUpdated: any = await this.mpInvoiceService.updateInvoice(
          response_mp_subscription_authorized_payment,
          response_mp_subscription_authorized_payment.id
        );
        const reference = resolveExternalReference(
          response_mp_subscription_authorized_payment.external_reference,
        );

        if (reference.type !== 'user') {
          // Regalos y Hacete Amigo bajan el plan a sus propios titulares (no al external_reference).
          this.logger.warn(
            `Pago rechazado del preapproval ${response_mp_subscription_authorized_payment.preapproval_id} (${reference.type}): el downgrade no se resuelve acá.`,
          );
        } else {
          const userId = reference.userId;
          /*
          Los límites de posts y contactos son ACUMULATIVOS entre las suscripciones activas
          del usuario. Si después de pausar la rechazada le queda otra paga, sus límites no
          bajaron y no corresponde tocarle ni los anuncios ni los contactos.
          */
          const hasOtherActive = await this.user_has_active_subscription(userId);
          if (hasOtherActive) {
            this.logger.warn(
              `El usuario ${userId} conserva otra suscripción activa: no se aplica downgrade`,
            );
          } else {
            const result = await this.update_plan_user(userId, downgrade_plan_contact);
            if (result) await this.update_plan_user(userId, downgrade_plan_post);
          }
        }

        await this.notifyInvoice(invoiceUpdated, paymentStatus);
        return true
      }

      const invoiceUpdated: any = await this.mpInvoiceService.updateInvoice(
        response_mp_subscription_authorized_payment,
        response_mp_subscription_authorized_payment.id
      );
      await this.notifyInvoice(invoiceUpdated, paymentStatus);

      /*
      Un pago aprobado reactiva la suscripción si la habíamos pausado por un
      rechazo. Antes sólo pasaba con retry_attempt > 0: un cobro aprobado con
      retry_attempt 0 dejaba al usuario pausado (sin plan) aunque había pagado.
      */
      if (approvedStatuses.has(paymentStatus)) {
        const preapprovalId = response_mp_subscription_authorized_payment.preapproval_id;
        const wasPaused = await this.subscriptionService.verifyIfSubscriptionWasPused(preapprovalId);
        if (wasPaused) {
          this.logger.warn(
            `Pago aprobado de una suscripción pausada (${preapprovalId}): vuelve a authorized. Pago: ${paymentStatus}, cuota: ${subscriptionStatus}, reintento: ${response_mp_subscription_authorized_payment.retry_attempt ?? 0}`,
          );
          await this.subscriptionService.changeStatusOfSubscription(preapprovalId, statusOfSubscription.AUTHORIZED);
        }
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

  /*
  Pausa la suscripción rechazada. Si no está en nuestra DB se deja constancia del error
  pero NO se corta el procesamiento: devolverle error a Meli sólo lograría que reintente
  un evento que nunca va a poder procesar, y el resto (invoice y notificación) sí se puede
  resolver. El caso aparece cuando el alta de la suscripción se perdió en su momento.
  */
  async pause_subscription_if_exists(preapproval_id: string): Promise<boolean> {
    try {
      await this.subscriptionService.changeStatusOfSubscription(
        preapproval_id,
        statusOfSubscription.PAUSED,
      );
      return true;
    } catch (error: any) {
      this.logger.error(
        `No se pudo pausar la suscripción ${preapproval_id}, no está en nuestra base: ` +
        error?.message,
      );
      return false;
    }
  }

  /*
  Indica si al usuario le queda alguna suscripción activa que no sea el plan
  gratuito (plan, pack, extra temporal, compartida o regalada). Se lee de
  User.subscriptions, así que también ve las que no paga él.
  Ante un error se asume que SÍ tiene una activa, para no bajarle el plan por las dudas.
  */
  async user_has_active_subscription(user_id: string): Promise<boolean> {
    try {
      const activeSubscriptions =
        await this.subscriptionService.getActivePaidSubscriptions(user_id);
      return (activeSubscriptions?.length ?? 0) > 0;
    } catch (error: any) {
      this.logger.error(
        `No se pudieron verificar las suscripciones activas de ${user_id}, ` +
        'se omite el downgrade por precaución: ' + error?.message,
      );
      return true;
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
      await this.errorService.createNewError(user, body);
    } catch (error: any) {
      throw error;
    }
  }








  is_a_card_validation(mercado_pago_response: any, type: string): Promise<boolean> {
    const limitOfCardValidation = 50;
    this.logger.log("Verifying if payment is a card validation");
    if (mercado_pago_response.operation_type === 'card_validation') {
      this.logger.warn(
        `MpWebhookAdapter - Case ${type} - type CARD_VALIDATION, sending response OK to meli & return`,
      );
      return Promise.resolve(true);
    }

    if (mercado_pago_response.transaction_amount <= limitOfCardValidation) {
      this.logger.warn(`Payment amount is less than $${limitOfCardValidation} is a card validation, returning OK to Meli`);
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }


}
