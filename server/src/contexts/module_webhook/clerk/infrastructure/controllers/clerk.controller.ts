/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Asegúrate de importar ConfigServic




import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { ClerkWebhookAdapter } from '../adapters/clerk-webhook.adapter';

/* 
  Servidor de prueba, se levanta con: ngrok http --domain=regular-loved-hare.ngrok-free.app 3000 
  WEB TEST URL:  https://regular-loved-hare.ngrok-free.app
*/

@Controller('webhook')
export class ClerkController {
  constructor(
    private readonly clerkWebhookAdapter: ClerkWebhookAdapter,
    private readonly configService: ConfigService,
    private readonly logger: MyLoggerService,
  ) { }

  @Post('/clerk')
  @HttpCode(HttpStatus.OK)
  async handleWebhookClerk(
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
  ): Promise<void> {
    const WEBHOOK_SECRET_CLERK = this.configService.get<string>('WEBHOOK_SECRET_CLERK');
    if (!WEBHOOK_SECRET_CLERK) {
      this.logger.error(
        'Please add WEBHOOK_SECRET_CLERK to your environment variables',
        'Class:WebhookController',
      );
      throw new Error(
        'Please add WEBHOOK_SECRET_CLERK to your environment variables',
      );
    }
    const user = await this.clerkWebhookAdapter.validateRequestAndProcessEvent(payload, headers);
    return user;
  }

}
