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
import { ApiExcludeEndpoint } from '@nestjs/swagger';



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
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  async handleWebhookClerk(
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
  ): Promise<void> {
    const WEBHOOK_SECRET = this.configService.get<string>('WEBHOOK_SECRET');
    if (!WEBHOOK_SECRET) {
      this.logger.error(
        'Please add WEBHOOK_SECRET to your environment variables',
        'Class:WebhookController',
      );
      throw new Error(
        'Please add WEBHOOK_SECRET to your environment variables',
      );
    }
    const user = await this.clerkWebhookAdapter.handleRequest(payload, headers);
    return user;
  }

}
