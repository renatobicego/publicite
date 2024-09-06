import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { MpHandlerEventsInterface } from 'src/contexts/webhook/domain/mercadopago/handler/mp.handler.events.interface';
import { MpHandlerValidationsInterface } from 'src/contexts/webhook/domain/mercadopago/handler/mp.handler.validations.interface';

/*
Adapter: responsable de orquestar la logica de procesamiento del webhook, utiliza el handler de eventos de la capa de aplicación.
Esta capa no deberia tener logica del negocio, sino que deberia orquestarla. 

Pendiente: 
- Separar logica de validacion del hash
- Aplicar interfaz e injection de dependencias para el adaptador

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

    const validation = await this.mpHandlerValidations.checkHashValidation(
      req,
      header,
    );

    if (validation) {
      this.logger.log('Webhook origin is valid, processing webhook data');
      //Si esto se cumple vamos a procesar el webhook
      try {
        const validationGetMp = await this.getDataFromMP(body);
        if (validationGetMp) {
          return Promise.resolve(true);
        } else {
          return Promise.resolve(false);
        }
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
    console.log(body);
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
        break;
      case 'subscription_authorized_payment':
        this.logger.log(
          'subscription_authorized_payment Case - Action: ' +
            action +
            ' Type: ' +
            type,
        );
        const subscription_authorized_payment_response =
          await this.subscription_authorized_payment(dataId);
        if (subscription_authorized_payment_response)
          return Promise.resolve(true);
        break;
      case 'subscription_preapproval':
        this.logger.log(
          'processing subscription_preapproval Case - Action: ' +
            action +
            ' Type: ' +
            type,
        );
        if (action === 'updated') {
          this.logger.log('We recive an subcription - ACTION: UPDATE');
          await this.subscription_preapproval_updated(dataId);
        }
        const subscription_preapproval_response =
          await this.subscription_preapproval(dataId);
        if (subscription_preapproval_response) return Promise.resolve(true);
        break;
      default:
        throw new BadRequestException('Invalid webhook headers');
    }
    return Promise.resolve(true);
  }

  async subscription_preapproval(dataID: string): Promise<boolean> {
    const result =
      await this.mpHandlerEvent.handleEvent_subscription_preapproval(dataID);
    if (result) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }

  async subscription_authorized_payment(dataID: string): Promise<boolean> {
    const result =
      await this.mpHandlerEvent.handleEvent_subscription_authorized_payment(
        dataID,
      );
    if (result) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }

  async payment(dataID: string, action: string): Promise<boolean> {
    const result = await this.mpHandlerEvent.handleEvent_payment(
      dataID,
      action,
    );
    if (result) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }

  async subscription_preapproval_updated(dataID: string): Promise<boolean> {
    const result =
      await this.mpHandlerEvent.handleEvent_subscription_preapproval_updated(
        dataID,
      );
    if (result) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
}
