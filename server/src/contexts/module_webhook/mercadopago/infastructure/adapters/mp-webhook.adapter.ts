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
  ) {}

  async handleRequestWebHookOriginValidation(
    header: Record<string, string>,
    req: Request,
  ): Promise<boolean> {
    const { body } = req;

    const validation = this.mpHandlerValidations.checkHashValidation(
      req,
      header,
    );

    if (validation) {
      try {
        this.logger.log('Webhook origin is valid, processing webhook data');
        //Si esto se cumple vamos a procesar el webhook
        this.getDataFromMP(body);
        return Promise.resolve(true);
        //una vez terminado de procesar guardaremos los datos necesarios y enviamos la notif que esta todo ok
      } catch (error: any) {
        throw error;
      }
    } else {
      return Promise.resolve(false);
    }
  }

  async getDataFromMP(body: any): Promise<boolean> {
    this.logger.log('----------------Getting data from MP--------------------');

    const dataId = body.data.id;
    const type = body.type;
    const action = body.action;
    this.logger.log(body);

    //Si no existen estos datos el header esta mal y no podremos seguir, arrojamos error
    if (!type || !dataId) {
      this.logger.error('Missing queryObject', 'Class:MpWebhookAdapter');
      throw new UnauthorizedException('Invalid webhook headers');
    }

    switch (type) {
      case 'payment':
        this.logger.log(
          'processing payment Case - Action: ' + action + ' Type: ' + type,
        );
        const payment = await this.payment(dataId, action);
        if (payment) return Promise.resolve(true);
        else return Promise.resolve(false);
      case 'subscription_preapproval':
        this.logger.log(
          'processing subscription_preapproval Case - Action: ' +
            action +
            ' Type: ' +
            type,
        );
        const subscription_preapproval_response =
          await this.subscription_preapproval(dataId, action);
        if (subscription_preapproval_response) return Promise.resolve(true);
        else return Promise.resolve(false);
      case 'subscription_authorized_payment':
        this.logger.log(
          'subscription_authorized_payment Case - Action: ' +
            action +
            ' Type: ' +
            type,
        );
        const subscription_authorized_payment_response =
          await this.subscription_authorized_payment(dataId, action);
        if (subscription_authorized_payment_response)
          return Promise.resolve(true);
        else return Promise.resolve(false);
      default:
        throw new BadRequestException(
          'Invalid webhook headers - Action: ' + action + ' Type: ' + type,
        );
    }
  }

  async payment(dataID: string, action: string): Promise<boolean> {
    // Hacer switch case para cada tipo de evento
    let response;
    switch (action) {
      case 'payment.created':
        response = await this.mpHandlerEvent.handleEvent_payment_create(dataID);
        if (response) return Promise.resolve(true);
        else return Promise.resolve(false);
      case 'payment.updated':
        response = await this.mpHandlerEvent.handleEvent_payment_update(dataID);
        if (response) return Promise.resolve(true);
        else return Promise.resolve(false);
      default:
        throw new BadRequestException(
          'An error was ocurred in payment PAYMENT ACTION IS NOT VALID - ACTION: ' +
            action,
        );
    }
  }

  async subscription_preapproval(
    dataID: string,
    action: string,
  ): Promise<boolean> {
    switch (action) {
      case 'created':
        this.logger.log('We recive an subcription - ACTION: CREATED');
        this.logger.log('We are creating a new subscription: ' + dataID);
        const result =
          await this.mpHandlerEvent.handleEvent_subscription_preapproval_create(
            dataID,
          );
        if (result) return Promise.resolve(true);
        else return Promise.resolve(false);
      case 'updated':
        this.logger.log('We recive an subcription - ACTION: UPDATE');
        this.logger.log('We are updating a subscription: ' + dataID);
        const subscription_preapproval_response =
          await this.mpHandlerEvent.handleEvent_subscription_preapproval_updated(
            dataID,
          );
        if (subscription_preapproval_response) return Promise.resolve(true);
        else return Promise.resolve(false);
      default:
        throw new BadRequestException(
          'An error was ocurred in subscription_preaproval - ACTION: ' +
            action +
            'DATA ID: ' +
            dataID,
        );
    }
  }

  async subscription_authorized_payment(
    dataID: string,
    action: string,
  ): Promise<boolean> {
    let result;
    switch (action) {
      case 'created':
        result =
          await this.mpHandlerEvent.handleEvent_subscription_authorized_payment_create(
            dataID,
          );
        if (result) return Promise.resolve(true);
        else return Promise.resolve(false);
      case 'updated':
        result =
          await this.mpHandlerEvent.handleEvent_subscription_authorized_payment_update(
            dataID,
          );
        if (result) return Promise.resolve(true);
        else return Promise.resolve(false);

      default:
        throw new BadRequestException(
          'An error was ocurred in subscription_authorized_payment INVALID - ACTION: ' +
            action +
            'DATA ID: ' +
            dataID,
        );
    }
  }
}
