import {
  Controller,
  Post,
  Headers,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Asegúrate de importar ConfigServic
import { Response } from 'express';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { ClerkWebhookAdapter } from '../adapters/clerk/clerk-webhook.adapter';
import { MpWebhookAdapter } from '../adapters/mercadopago/mp-webhook.adapter';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('webhook/qa')
export class qaControllerMeli {
  constructor(
    private readonly clerkWebhookAdapter: ClerkWebhookAdapter,
    private readonly configService: ConfigService,
    private readonly mpWebhookAdapter: MpWebhookAdapter,
    private readonly logger: MyLoggerService,
  ) {}

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
      const authSecretValidation =
        await this.mpWebhookAdapter.handleRequestWebHookOriginValidation(
          headers,
          req,
        );
      if (authSecretValidation) {
        //En el caso de que validemos el origen y que el pago se complete correctamente, vamos a deolver el estado OK, de lo contrario esta operacion no se hara
        //this.logger.log('Webhook MP OK - Credentials are valid - WEBHOOK_PROCESS: COMPLETE ---> sending response to Meli - Class:WebhookController 🚀')
        return res.status(HttpStatus.OK).send('Signature verified');
      } else {
        //this.logger.error('Webhook MP FAIL - Credentials are not valid', 'Class:WebhookController')
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .send('Signature verification failed');
      }
    } catch (error) {
      //this.logger.error(error +  'Class:WebhookController')
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal Server Error');
    }
  }
}
