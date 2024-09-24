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
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Asegúrate de importar ConfigServic
import { Response } from 'express';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

import { ClerkWebhookAdapter } from '../adapters/clerk/clerk-webhook.adapter';
import { MpWebhookAdapter } from '../adapters/mercadopago/mp-webhook.adapter';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';

/* 
  Servidor de prueba, se levanta con: ngrok http --domain=regular-loved-hare.ngrok-free.app 3000 
  WEB TEST URL:  https://regular-loved-hare.ngrok-free.app
*/

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly clerkWebhookAdapter: ClerkWebhookAdapter,
    private readonly configService: ConfigService,
    private readonly mpWebhookAdapter: MpWebhookAdapter,
    private readonly logger: MyLoggerService

  ) { }


  @Post('/clerk')
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  async handleWebhookClerk(
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
  ): Promise<void> {
    const WEBHOOK_SECRET = this.configService.get<string>('WEBHOOK_SECRET');
    if (!WEBHOOK_SECRET) {
      this.logger.error('Please add WEBHOOK_SECRET to your environment variables', 'Class:WebhookController')
      throw new Error(
        'Please add WEBHOOK_SECRET to your environment variables',
      );
    }
    const user = await this.clerkWebhookAdapter.handleRequest(payload, headers);
    return user;
  }

  @Post('/mp')
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  async handleWebhookMp(
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response> {
    try {
      //Valido el origen de la petición
        this.mpWebhookAdapter.handleRequestWebHookOriginValidation(
          headers, req
        )
        this.logger.log('Webhook MP OK - Credentials are valid - WEBHOOK_PROCESS: COMPLETE ---> sending response to Meli - Class:WebhookController 🚀')
        return res.status(HttpStatus.OK).send();
    } catch (error) {
      console.log(error);
      this.logger.error(error +  'Class:WebhookController')
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(error);
    }
  }


  @Post('/mp-test')
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  async handleMpTest(
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
    @Req() req: Request,
    @Body() body: any,
  ): Promise<Response> {
    try {
      //Valido el origen de la petición

      const authSecretValidation =
        await this.mpWebhookAdapter.subscription_authorized_payment("7013024089","updated");
      if (authSecretValidation) {
        //En el caso de que validemos el origen y que el pago se complete correctamente, vamos a deolver el estado OK, de lo contrario esta operacion no se hara 
        this.logger.log('Webhook MP OK - Credentials are valid - WEBHOOK_PROCESS: COMPLETE ---> sending response to Meli - Class:WebhookController 🚀')
        return res.status(HttpStatus.OK).send('Signature verified');
      } else {
        this.logger.error('Webhook MP FAIL - Credentials are not valid', 'Class:WebhookController')
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .send('Signature verification failed');
      }
    } catch (error) {
      this.logger.error(error, 'Class:WebhookController')
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal Server Error');
    }
  }
  @Get('health')
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  async healthTest(): Promise<{ status: string }> {
    this.logger.log('Service ON - Class:WebhookController')
    return { status: 'Service ON' };
  }
}
