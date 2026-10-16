import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { MpHandlerEventsInterface } from 'src/contexts/module_webhook/mercadopago/domain/handler/mp.handler.events.interface';
import { MpHandlerValidationsInterface } from 'src/contexts/module_webhook/mercadopago/domain/handler/mp.handler.validations.interface';

/*
Adapter: responsable de orquestar la logica de procesamiento del webhook, utiliza el handler de eventos de la capa de aplicación.
Esta capa no deberia tener logica del negocio, sino que deberia orquestarla. 

*/

@Injectable()
export class MpWebhookAdapter {
  constructor(
    @Inject('MpHandlerEventsInterface')
    private readonly mpHandlerEvent: MpHandlerEventsInterface,
    @Inject('MpHandlerValidationsInterface')
    private readonly mpHandlerValidations: MpHandlerValidationsInterface,

    private readonly logger: MyLoggerService,
  ) { }

  async validateRequestAndHandleTypeOfEvent(
    header: Record<string, string>,
    req: Request,
  ): Promise<boolean> {
    const { body } = req;
    this.logger.log('-----MpWebhookAdapter: Validation origin of Webhook-----');
    const isHashValid = this.mpHandlerValidations.isHashValid(
      req,
      header,
    );

    if (isHashValid) {
      this.logger.log('MpWebhookAdapter: Webhook origin is valid, processing webhook data');
      /*
      IMPORTANTE: hay que ESPERAR el procesamiento antes de devolverle la respuesta a Meli.
      En Firebase Functions la instancia se congela apenas se responde, así que todo trabajo
      async que haya quedado pendiente se corta a la mitad y se pierde sin dejar error.
      Así se perdían altas de suscripción ya cobradas (el camino más largo del handler).
      */
      return await this.processOperationType(body);
    } else {
      return Promise.resolve(false);
    }
  }


  async processOperationType(body: any): Promise<boolean> {
    try {
      this.logger.log('----------------Processing mercadopago EVENT--------------------');

      const { id, type, action } = this.validateBodyAndReturnData(body);
      this.logger.log(`Processing ${type} Case - Action: ${action} Type: ${type}`);



      switch (type) {
        case 'payment':
          const payment = await this.process_payment(id, action);
          if (payment) {
            return Promise.resolve(true);
          } else {
            return Promise.resolve(false);
          }

        case 'subscription_preapproval':
          const subscription_preapproval_response =
            await this.process_subscription_preapproval(id, action);

          if (subscription_preapproval_response) {
            return Promise.resolve(true);
          } else {
            return Promise.resolve(false);
          }

        case 'subscription_authorized_payment':

          const subscription_authorized_payment_response =
            await this.process_subscription_authorized_payment(id, action);

          if (subscription_authorized_payment_response) {
            return Promise.resolve(true);
          } else {
            return Promise.resolve(false);
          }


        default:
          /*
          Meli manda tipos de evento que no procesamos. Se confirman con OK a propósito:
          devolver error haría que los reintente indefinidamente, y no son un fallo nuestro.
          */
          this.logger.warn(
            'Evento de Mercado Pago no soportado, se confirma sin procesar - Type: ' +
            type +
            ' Action: ' +
            action,
          );
          return Promise.resolve(true);
      }
    } catch (error: any) {
      throw error;
    }
  }

  validateBodyAndReturnData(body: any): {
    id: string;
    type: string;
    action: string;
  } {
    this.logger.log('----------------Validationg Body of mercadopago webhook--------------------');
    try {
      let id;
      let type;
      let action;

      if (body && body.data && body.type && body.action) {

        id = body.data.id;
        type = body.type;
        action = body.action;

        this.logger.log(body);

      } else {
        this.logger.error('Invalid webhook headers- Missing dataId, type or action - Method handleTypeOfOperationMercadopago');
        throw new UnauthorizedException('Invalid webhook headers- Missing dataId, type or action');
      }

      return {
        id,
        type,
        action
      }
    } catch (error: any) {
      throw error;
    }
  }


  async process_payment(dataID: string, action: string): Promise<boolean> {
    let response;

    this.logger.log("Processing payment Action: " + action);
    switch (action) {
      case 'payment.created':
        response = await this.mpHandlerEvent.create_payment(dataID);
        return this.isThisResponseDataCompleted(response);

      case 'payment.updated':
        response = await this.mpHandlerEvent.update_payment(dataID);
        return this.isThisResponseDataCompleted(response);

      default:
        // Action no soportada: se confirma para que Meli no la reintente indefinidamente.
        this.logger.warn(
          'Action de payment no soportada, se confirma sin procesar - ACTION: ' + action,
        );
        return Promise.resolve(true);
    }
  }

  async process_subscription_preapproval(
    dataID: string,
    action: string,
  ): Promise<boolean> {
    try {
      this.logger.log("Processing subcription Action: " + action);
      switch (action) {
        case 'created':
          const result =
            await this.mpHandlerEvent.create_subscription_preapproval(
              dataID,
            );
          return this.isThisResponseDataCompleted(result);
        case 'updated':
          const subscription_preapproval_response =
            await this.mpHandlerEvent.update_subscription_preapproval(
              dataID,
            );

          return this.isThisResponseDataCompleted(subscription_preapproval_response);

        default:
          // Action no soportada: se confirma para que Meli no la reintente indefinidamente.
          this.logger.warn(
            'Action de subscription_preapproval no soportada, se confirma sin procesar - ACTION: ' +
            action +
            ' DATA ID: ' +
            dataID,
          );
          return Promise.resolve(true);
      }
    } catch (error: any) {
      throw error;
    }
  }

  async process_subscription_authorized_payment(
    dataID: string,
    action: string,
  ): Promise<boolean> {
    let result;
    this.logger.log("Processing subcription_authorized_payment Action: " + action);
    switch (action) {
      case 'created':
        result =
          await this.mpHandlerEvent.create_subscription_authorized_payment(
            dataID,
          );

        return this.isThisResponseDataCompleted(result);
      case 'updated':
        result =
          await this.mpHandlerEvent.update_subscription_authorized_payment(
            dataID,
          );

        return this.isThisResponseDataCompleted(result);

      default:
        // Action no soportada: se confirma para que Meli no la reintente indefinidamente.
        this.logger.warn(
          'Action de subscription_authorized_payment no soportada, se confirma sin procesar - ACTION: ' +
          action +
          ' DATA ID: ' +
          dataID,
        );
        return Promise.resolve(true);
    }
  }



  isThisResponseDataCompleted(data: any): Promise<boolean> {
    if (data && data != undefined) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }

  // async test_payment_notif(testType: string, userId: string) {
  //   const subscription = {
  //     subscriptionPlan: "66c49508e80296e90ec637d8"
  //   }

  //   let paymentDataFromMeli: PaymentDataFromMeli = {
  //     event: payment_notification_events_enum.payment_approved,
  //     subscriptionPlanId: subscription.subscriptionPlan,
  //     reason: "Publicite premium",
  //     status: 'approved',
  //     retryAttemp: "0",
  //     userId: userId,
  //   }

  //   if (testType === 'rejected') {
  //     paymentDataFromMeli = {
  //       event: payment_notification_events_enum.payment_rejected,
  //       subscriptionPlanId: subscription.subscriptionPlan,
  //       reason: "Publicite premium",
  //       status: 'rejected',
  //       retryAttemp: "2",
  //       userId: userId,
  //     }
  //   }

  //   if (testType === 'pending') {
  //     paymentDataFromMeli = {
  //       event: payment_notification_events_enum.payment_pending,
  //       subscriptionPlanId: subscription.subscriptionPlan,
  //       reason: "Publicite premium",
  //       status: 'pending',
  //       retryAttemp: "0",
  //       userId: userId,
  //     }
  //   }

  //   await this.emmiter.emitAsync(subscription_event, paymentDataFromMeli);


  // }



}

