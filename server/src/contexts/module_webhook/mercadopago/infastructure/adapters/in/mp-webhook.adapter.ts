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

  async handleMercadoPagoWebhookRequest(
    header: Record<string, string>,
    req: Request,
  ): Promise<boolean> {
    const { body } = req;

    const isHashValid = this.mpHandlerValidations.isHashValid(
      req,
      header,
    );

    if (isHashValid) {
      try {
        this.logger.log('Webhook origin is valid, processing webhook data');


        this.handleTypeOfOperationMercadopago(body);

        return Promise.resolve(true);
      } catch (error: any) {
        throw error;
      }
    } else {
      return Promise.resolve(false);
    }
  }

  async handleTypeOfOperationMercadopago(body: any): Promise<boolean> {
    try {

      this.logger.log('----------------Getting data from MP--------------------');

      const { idOfOperation, type, action } = this.bodyValidationAndExtractData(body);

      switch (type) {
        case 'payment':
          this.logger.log(`Processing ${type} Case - Action: ${action} Type: ${type}`);

          const payment = await this.process_payment(idOfOperation, action);

          if (payment) {
            return Promise.resolve(true);
          } else {
            return Promise.resolve(false);
          }

        case 'subscription_preapproval': // PLAN DE SUSCRIPCION
          this.logger.log(`Processing ${type} Case - Action: ${action} Type: ${type}`);

          const subscription_preapproval_response =
            await this.process_subscription_preapproval(idOfOperation, action);

          if (subscription_preapproval_response) {
            return Promise.resolve(true);
          } else {
            return Promise.resolve(false);
          }

        case 'subscription_authorized_payment':
          this.logger.log(`Processing ${type} Case - Action: ${action} Type: ${type}`);


          const subscription_authorized_payment_response =
            await this.process_subscription_authorized_payment(idOfOperation, action);

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

  bodyValidationAndExtractData(body: any): {
    idOfOperation: string;
    type: string;
    action: string;
  } {
    this.logger.log('----------------Validationg Body of mercadopago webhook--------------------');
    try {
      let idOfOperation;
      let type;
      let action;

      if (body && body.data && body.type && body.action) {

        idOfOperation = body.data.id;
        type = body.type;
        action = body.action;

        this.logger.log(body);

      } else {
        this.logger.error('Invalid webhook headers- Missing dataId, type or action - Method handleTypeOfOperationMercadopago');
        throw new UnauthorizedException('Invalid webhook headers- Missing dataId, type or action');
      }

      return {
        idOfOperation,
        type,
        action
      }
    } catch (error: any) {
      throw error;
    }
  }


  async process_payment(dataID: string, action: string): Promise<boolean> {
    let response;

    switch (action) {
      case 'payment.created':
        response = await this.mpHandlerEvent.check_status_of_the_payment_and_create(dataID);
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
      switch (action) {
        case 'created':

          this.logger.log('We recive an subcription - ACTION: CREATED');
          this.logger.log('We are creating a new subscription: ' + dataID);
          const result =
            await this.mpHandlerEvent.create_subscription_preapproval(
              dataID,
            );
          return this.isThisResponseDataCompleted(result);

        case 'updated':
          this.logger.log('We recive an subcription - ACTION: UPDATE');
          this.logger.log('We are updating a subscription: ' + dataID);

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

}

