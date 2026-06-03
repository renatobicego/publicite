import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { WhatsAppSenderInterface } from './whatsapp.sender.interface';

// Límite de caracteres de un mensaje de texto en WhatsApp Cloud API.
const WHATSAPP_TEXT_MAX_LENGTH = 4096;

/**
 * Cliente HTTP hacia la Graph API de Meta para enviar mensajes de WhatsApp.
 * Usa el Phone Number ID y el Access Token (System User) configurados por env.
 */
@Injectable()
export class WhatsAppSender implements WhatsAppSenderInterface {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: MyLoggerService,
  ) {}

  async sendText(to: string, body: string): Promise<void> {
    const apiVersion =
      this.configService.get<string>('WHATSAPP_API_VERSION') ?? 'v21.0';
    const phoneNumberId = this.configService.get<string>(
      'WHATSAPP_PHONE_NUMBER_ID',
    );
    const accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');

    if (!phoneNumberId || !accessToken) {
      this.logger.error(
        'Faltan WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN en las variables de entorno',
        'WhatsAppSender',
      );
      throw new Error('WhatsApp Cloud API no está configurada correctamente');
    }

    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
    const text = (body ?? '').slice(0, WHATSAPP_TEXT_MAX_LENGTH);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { preview_url: true, body: text },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `Error enviando mensaje a WhatsApp (${response.status}): ${errorBody}`,
          'WhatsAppSender',
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Fallo de red enviando mensaje a WhatsApp: ${error.message}`,
        'WhatsAppSender',
      );
    }
  }
}
