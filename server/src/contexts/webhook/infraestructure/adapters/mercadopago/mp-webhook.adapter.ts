import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Asegúrate de importar ConfigServic
import * as crypto from 'crypto';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { MpHandlerEventsInterface } from 'src/contexts/webhook/domain/mercadopago/handler/eventHandler.interface';

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
    private readonly configService: ConfigService,
    @Inject('MpHandlerEventsInterface')
    private readonly mpHandlerEvent: MpHandlerEventsInterface,
    private readonly logger: MyLoggerService,
  ) {}

  async handleRequestWebHookOriginValidation(
    header: Record<string, string>,
    req: Request,
  ): Promise<boolean> {
    const request = req.url.split('?')[1];
    const queryObject = new URLSearchParams(request);
    const { body } = req;
    const dataId = queryObject.get('data.id');

    const xSignature = header['x-signature'];
    const xRequestId = header['x-request-id'];
    if (!xSignature || !xRequestId) {
      this.logger.error('Invalid webhook headers');
      throw new UnauthorizedException('Invalid webhook headers');
    }

    const validation = this.checkHashValidation(
      xSignature,
      xRequestId,
      dataId ?? '',
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

  checkHashValidation(xSignature: string, xRequestId: string, dataId: string) {
    // Separate x-signature into parts
    const parts = xSignature.split(',');
    let ts: string | undefined;
    let hash: string | undefined;

    // Iterate over the values to obtain ts and v1
    parts.forEach((part) => {
      // Split each part into key and value
      const [key, value] = part.split('=');
      if (key && value) {
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();
        if (trimmedKey === 'ts') {
          ts = trimmedValue;
        } else if (trimmedKey === 'v1') {
          hash = trimmedValue;
        }
      }
    });

    const secret = this.configService.get<string>('SECRET_KEY_MP_WEBHOOK');
    if (!secret) {
      this.logger.error(
        'Please add SECRET_KEY_MP_WEBHOOK to your environment variables',
      );
      return Promise.resolve(false);
    }

    // Create the manifest string
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    // Generate the HMAC signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const sha = hmac.digest('hex');
    if (sha === hash) {
      return true;
    } else {
      return false;
    }
  }

  async getDataFromMP(body: any): Promise<boolean> {
    this.logger.log('Getting data from MP');

    const dataId = body.data.id;
    const type = body.type;

    //Si no existen estos datos el header esta mal y no podremos seguir, arrojamos error
    if (!type || !dataId) {
      this.logger.error('Missing queryObject', 'Class:MpWebhookAdapter');
      throw new UnauthorizedException('Invalid webhook headers');
    }

    const action = body.action;
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
            ' Type: ' +
            type,
        );
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
}
