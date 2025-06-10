import {
  BadRequestException,
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
      try {
        this.logger.log('MpWebhookAdapter: Webhook origin is valid, processing webhook data');
        this.processOperationType(body);
        return Promise.resolve(true);
      } catch (error: any) {
        throw error;
      }
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
          throw new BadRequestException(
            'Invalid webhook headers - Action: ' + action + ' Type: ' + type,
          );
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
        throw new BadRequestException(
          'An error was ocurred in payment PAYMENT ACTION IS NOT VALID - ACTION: ' +
          action,
        );
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
          throw new BadRequestException(
            'An error was ocurred in subscription_preaproval - ACTION: ' +
            action +
            'DATA ID: ' +
            dataID,
          );
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
        throw new BadRequestException(
          'An error was ocurred in subscription_authorized_payment INVALID - ACTION: ' +
          action +
          'DATA ID: ' +
          dataID,
        );
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

