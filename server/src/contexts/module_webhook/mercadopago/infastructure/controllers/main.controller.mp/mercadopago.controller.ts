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
import { Response } from 'express';
import { ApiExcludeEndpoint } from '@nestjs/swagger';


import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { MpWebhookAdapter } from '../../adapters/in/mp-webhook.adapter';



@Controller('webhook')
export class MercadopagoController {
  constructor(
    private readonly mpWebhookAdapter: MpWebhookAdapter,
    private readonly logger: MyLoggerService,
  ) { }



  @Post('/mp')
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  async handleWebhookMp(
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response> {
    try {
      this.mpWebhookAdapter.handleMercadoPagoWebhookRequest(headers, req);
      this.logger.log(
        'Webhook MP OK - Credentials are valid - WEBHOOK_PROCESS: COMPLETE ---> sending response to Meli - Class:WebhookController 🚀',
      );
      return res.status(HttpStatus.OK).send();
    } catch (error) {
      console.log(error);
      this.logger.error(error + 'Class:WebhookController');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);
    }
  }


  /* DONT ACTIVE THIS METHOD IN PRODUCTION*/

  @Get('/mp-test')
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  async handleMpTest(
    @Res() res: Response,
  ): Promise<any> {
    try {
      //Valido el origen de la petición
      // const body = {
      //   action: "payment.created",
      //   api_version: "v1",
      //   data: {
      //     id: "96737892838"
      //   },
      //   date_created: "2024-12-18T16:08:07Z",
      //   id: 117838832053,
      //   live_mode: true,
      //   type: "payment",
      //   user_id: "281287230"
      // };

      const authSecretValidation =
        await this.mpWebhookAdapter.process_subscription_authorized_payment(
          "7015532872", "updated"
        );
      if (authSecretValidation) {
        //En el caso de que validemos el origen y que el pago se complete correctamente, vamos a deolver el estado OK, de lo contrario esta operacion no se hara
        this.logger.log(
          'Webhook MP OK - Credentials are valid - WEBHOOK_PROCESS: COMPLETE ---> sending response to Meli - Class:WebhookController 🚀',
        );
        return res.status(HttpStatus.OK).send('Signature verified');
      } else {
        this.logger.error(
          'Webhook MP FAIL - Credentials are not valid',
          'Class:WebhookController',
        );
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .send('Signature verification failed');
      }
    } catch (error) {
      this.logger.error(error, 'Class:WebhookController');
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal Server Error');
    }
  }
  @Get('health')
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  async healthTest(): Promise<{ status: string }> {
    this.logger.log('Service ON - Class:WebhookController');
    return { status: 'Service ON' };
  }
}
