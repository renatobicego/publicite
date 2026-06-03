import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  UnauthorizedException,
  RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as crypto from 'crypto';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { WhatsAppService } from '../../application/service/whatsapp.service';
import { WhatsAppWebhookPayload } from '../../domain/entity/whatsapp-webhook.payload';

/**
 * Webhook de la WhatsApp Cloud API (Meta).
 *
 * - GET  /webhook/whatsapp  → handshake de verificación (Meta valida la URL).
 * - POST /webhook/whatsapp  → recepción de mensajes entrantes (firmados con App Secret).
 *
 * Requiere las env: WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET
 * (más las del sender: WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_API_VERSION).
 */
@Controller('webhook')
export class WhatsAppController {
  constructor(
    private readonly whatsAppService: WhatsAppService,
    private readonly configService: ConfigService,
    private readonly logger: MyLoggerService,
  ) {}

  /**
   * Verificación del webhook (una sola vez, al configurar la URL en Meta).
   * Meta envía hub.mode=subscribe, hub.verify_token y hub.challenge.
   * Si el token coincide, hay que devolver el challenge en texto plano.
   */
  @Get('/whatsapp')
  verifyWebhook(@Query() query: Record<string, string>): string {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    const verifyToken = this.configService.get<string>(
      'WHATSAPP_VERIFY_TOKEN',
    );

    if (mode === 'subscribe' && token && token === verifyToken) {
      this.logger.log('Webhook de WhatsApp verificado correctamente');
      return challenge;
    }

    this.logger.error(
      'Verificación de webhook de WhatsApp fallida: token inválido',
      'WhatsAppController',
    );
    throw new ForbiddenException('Verify token inválido');
  }

  /**
   * Recepción de eventos. Devuelve 200 rápido (Meta reintenta si no).
   * Valida la firma HMAC-SHA256 sobre el body crudo antes de procesar.
   */
  @Post('/whatsapp')
  @HttpCode(HttpStatus.OK)
  async receiveWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() payload: WhatsAppWebhookPayload,
    @Headers('x-hub-signature-256') signature: string,
  ): Promise<void> {
    this.assertValidSignature(req.rawBody, signature);

    // Procesamos inline (la respuesta del agente entra en el timeout de la function).
    await this.whatsAppService.processWebhook(payload);
  }

  private assertValidSignature(
    rawBody: Buffer | undefined,
    signature: string | undefined,
  ): void {
    const appSecret = this.configService.get<string>('WHATSAPP_APP_SECRET');

    if (!appSecret) {
      this.logger.error(
        'Falta WHATSAPP_APP_SECRET en las variables de entorno',
        'WhatsAppController',
      );
      throw new Error('WhatsApp App Secret no configurado');
    }

    if (!rawBody) {
      this.logger.error(
        'No se pudo acceder al body crudo (¿rawBody habilitado en el bootstrap?)',
        'WhatsAppController',
      );
      throw new UnauthorizedException('Body inválido');
    }

    if (!signature || !signature.startsWith('sha256=')) {
      throw new UnauthorizedException('Firma ausente o con formato inválido');
    }

    const expected = crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex');
    const received = signature.slice('sha256='.length);

    const expectedBuf = Buffer.from(expected, 'hex');
    const receivedBuf = Buffer.from(received, 'hex');

    if (
      expectedBuf.length !== receivedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      this.logger.error(
        'Firma de webhook de WhatsApp inválida',
        'WhatsAppController',
      );
      throw new UnauthorizedException('Firma inválida');
    }
  }
}
