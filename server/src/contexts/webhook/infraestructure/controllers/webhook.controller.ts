/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Get,
  Res,
  // Logger,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Asegúrate de importar ConfigServic
import { query, Response } from 'express';

import { ClerkWebhookAdapter } from '../adapters/clerk/clerk-webhook.adapter';
import { MpWebhookAdapter } from '../adapters/mercadopago/mp-webhook.adapter';

/* 
  Servidor de prueba, se levanta con: ngrok http --domain=regular-loved-hare.ngrok-free.app 3000 
  WEB TEST URL:  https://regular-loved-hare.ngrok-free.app
*/

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly clerkWebhookAdapter: ClerkWebhookAdapter,
    private readonly configService: ConfigService, // Inyecta ConfigService
    private readonly mpWebhookAdapter: MpWebhookAdapter,
  ) {}

  @Post('/clerk')
  @HttpCode(HttpStatus.OK)
  async handleWebhookClerk(
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
  ): Promise<void> {
    const WEBHOOK_SECRET = this.configService.get<string>('WEBHOOK_SECRET');

    if (!WEBHOOK_SECRET) {
      throw new Error(
        'Please add WEBHOOK_SECRET to your environment variables',
      );
    }

    await this.clerkWebhookAdapter.handleRequest(payload, headers);
  }

  @Post('/mp')
  @HttpCode(HttpStatus.OK)
  async handleWebhookMp(
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response> {
    try {
      /*
      Ver este codigo. Deberiamos recibir desde el front el numero de pago y el tipo de evento, con estod eberiamos chequear si el pago esta OK en la api de MP y guardar los datos
      webhook test no lo puede validar, no se porque ya que creo que brinda el ultimo paso de la validacion
      */

      const request = req.url.split('?')[1];
      const queryObject = new URLSearchParams(request);
      const dataId = queryObject.get('data.id');
      const preApprovalId = queryObject.get('data.preapproval_id');
      const type = queryObject.get('type');
      const MP_ACCESS_TOKEN = this.configService.get<string>('MP_ACCESS_TOKEN');
      console.log(type)
      if(type === "subscription_authorized_payment"){
        console.log('MP-WEBHOOK PAYMENT AUTHORIZED');
        const rrr = await fetch(
          `https://api.mercadopago.com/preapproval/${preApprovalId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
            },
          },
        );
        // console.log(await rrr.json());
      }
      // Update en la subscripción 
      if (type === 'subscription_preapproval') {
        console.log('MP-WEBHOOK PAYMENT PREAPPROVAL');
        const rrr = await fetch(
          `https://api.mercadopago.com/preapproval/${dataId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
            },
          },
        );
        // console.log(await rrr.json());
      }

      const xSignature = headers['x-signature'];
      const xRequestId = headers['x-request-id'];
      if (!xSignature || !xRequestId) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send('Missing required headers');
      }
      const authSecretValidation =
        await this.mpWebhookAdapter.handleRequestValidation(
          xSignature,
          xRequestId,
          dataId as string,
        );
      if (authSecretValidation) {
        console.log('MP-WEBHOOK VALIDATED');

        return res.status(HttpStatus.OK).send('Signature verified');
      } else {
        console.log('MP-WEBHOOK FAILED');
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .send('Signature verification failed');
      }
    } catch (error) {
      console.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal Server Error');
    }
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthTest(): Promise<{ status: string }> {
    return { status: 'Service ON' };
  }
}
