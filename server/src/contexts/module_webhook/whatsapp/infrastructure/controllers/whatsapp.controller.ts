import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
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
 * Webhook de YCloud (BSP de WhatsApp).
 *
 * - POST /webhook/whatsapp  → recepción de eventos (mensajes entrantes y otros).
 *
 * YCloud NO usa handshake de verificación por GET (a diferencia de Meta): se configura
 * la URL en la consola de YCloud y empieza a mandar eventos por POST directamente.
 * Cada POST viene firmado en el header `YCloud-Signature`.
 *
 * Requiere las env: YCLOUD_WEBHOOK_SECRET (valida la firma),
 * YCLOUD_API_KEY (envío) y opcionalmente YCLOUD_FROM_PHONE.
 */
@Controller('webhook')
export class WhatsAppController {
  constructor(
    private readonly whatsAppService: WhatsAppService,
    private readonly configService: ConfigService,
    private readonly logger: MyLoggerService,
  ) {}

  /**
   * Recepción de eventos. Devuelve 200 rápido (YCloud reintenta si no).
   * Valida la firma HMAC-SHA256 sobre `{timestamp}.{body crudo}` antes de procesar.
   */
  @Post('/whatsapp')
  @HttpCode(HttpStatus.OK)
  async receiveWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() payload: WhatsAppWebhookPayload,
    @Headers('ycloud-signature') signature: string,
  ): Promise<void> {
    this.assertValidSignature(req.rawBody, signature);

    // Procesamos inline (la respuesta del agente entra en el timeout de la function).
    await this.whatsAppService.processWebhook(payload);
  }

  /**
   * Verifica la firma del webhook de YCloud.
   * Header: `YCloud-Signature: t={timestamp},s={signature}`.
   * Firma esperada: HMAC-SHA256( `${timestamp}.${rawBody}`, YCLOUD_WEBHOOK_SECRET ).
   * Doc: https://docs.ycloud.com/reference/webhook-integration-guide
   */
  private assertValidSignature(
    rawBody: Buffer | undefined,
    signatureHeader: string | undefined,
  ): void {
    const secret = this.configService.get<string>('YCLOUD_WEBHOOK_SECRET');

    if (!secret) {
      this.logger.error(
        'Falta YCLOUD_WEBHOOK_SECRET en las variables de entorno',
        'WhatsAppController',
      );
      throw new Error('YCloud Webhook Secret no configurado');
    }

    if (!rawBody) {
      this.logger.error(
        'No se pudo acceder al body crudo (¿rawBody habilitado en el bootstrap?)',
        'WhatsAppController',
      );
      throw new UnauthorizedException('Body inválido');
    }

    const { timestamp, signature } = this.parseSignatureHeader(signatureHeader);
    if (!timestamp || !signature) {
      throw new UnauthorizedException('Firma ausente o con formato inválido');
    }

    const signedPayload = `${timestamp}.${rawBody.toString('utf8')}`;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    const expectedBuf = Buffer.from(expected, 'hex');
    const receivedBuf = Buffer.from(signature, 'hex');

    if (
      expectedBuf.length !== receivedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      this.logger.error(
        'Firma de webhook de YCloud inválida',
        'WhatsAppController',
      );
      throw new UnauthorizedException('Firma inválida');
    }
  }

  /**
   * Parsea el header `t={timestamp},s={signature}` de forma tolerante al orden
   * y a espacios entre los segmentos.
   */
  private parseSignatureHeader(header: string | undefined): {
    timestamp?: string;
    signature?: string;
  } {
    if (!header) {
      return {};
    }

    const result: { timestamp?: string; signature?: string } = {};
    for (const part of header.split(',')) {
      const [key, value] = part.split('=');
      const k = key?.trim();
      const v = value?.trim();
      if (k === 't') {
        result.timestamp = v;
      } else if (k === 's') {
        result.signature = v;
      }
    }
    return result;
  }
}
