import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { WhatsAppSenderInterface } from './whatsapp.sender.interface';

// Límite de caracteres de un mensaje de texto en WhatsApp.
const WHATSAPP_TEXT_MAX_LENGTH = 4096;

// Endpoint de envío de mensajes de YCloud (encola y devuelve el id del mensaje).
const YCLOUD_MESSAGES_URL = 'https://api.ycloud.com/v2/whatsapp/messages';

/**
 * Cliente HTTP hacia la API de YCloud para enviar mensajes de WhatsApp.
 * Autentica con la API Key (header `X-API-Key`) configurada por env.
 * Doc: https://docs.ycloud.com/reference/whatsapp_message-send
 */
@Injectable()
export class WhatsAppSender implements WhatsAppSenderInterface {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: MyLoggerService,
  ) {}

  async sendText(from: string, to: string, body: string): Promise<void> {
    const apiKey = this.configService.get<string>('YCLOUD_API_KEY');

    if (!apiKey) {
      this.logger.error(
        'Falta YCLOUD_API_KEY en las variables de entorno',
        'WhatsAppSender',
      );
      throw new Error('YCloud no está configurado correctamente');
    }

    if (!from) {
      this.logger.error(
        'No se pudo determinar el número del negocio (from) para responder por YCloud',
        'WhatsAppSender',
      );
      throw new Error('Número de origen (from) no disponible');
    }

    const text = (body ?? '').slice(0, WHATSAPP_TEXT_MAX_LENGTH);

    try {
      const response = await fetch(YCLOUD_MESSAGES_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.toE164(from),
          to: this.toE164(to),
          type: 'text',
          text: { body: text, preview_url: true },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `Error enviando mensaje a YCloud (${response.status}): ${errorBody}`,
          'WhatsAppSender',
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Fallo de red enviando mensaje a YCloud: ${error.message}`,
        'WhatsAppSender',
      );
    }
  }

  /**
   * Normaliza un teléfono a E.164 (con `+`): saca espacios, guiones y paréntesis,
   * y antepone `+` si falta. YCloud espera el formato E.164 en `from`/`to`.
   */
  private toE164(phone: string): string {
    const cleaned = (phone ?? '').replace(/[\s\-()]/g, '');
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }
}
