import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { ChatbotServiceInterface } from 'src/contexts/module_user/chatbot/domain/service/chatbot.service.interface';
import { ChatbotAction } from 'src/contexts/module_user/chatbot/domain/entity/enum/chatbot.action.enum';
import {
  WhatsAppSenderInterface,
  WHATSAPP_SENDER,
} from '../adapter/out/whatsapp.sender.interface';
import {
  WhatsAppWebhookPayload,
  YCloudInboundMessage,
  YCLOUD_INBOUND_MESSAGE_EVENT,
} from '../../domain/entity/whatsapp-webhook.payload';

// Copy que se agrega cuando el agente detecta intención de crear un anuncio.
// En la web esto abre un formulario; en WhatsApp no hay UI, así que mandamos el link.
const CREATE_AD_LINK = 'https://soonpublicite.com/crear/anuncio';
const CREATE_AD_WHATSAPP_HINT = `\n\n👉 Creá tu anuncio acá: ${CREATE_AD_LINK}`;

const NON_TEXT_REPLY =
  'Por ahora solo puedo responder mensajes de texto 🙂. Escribime tu consulta sobre Publicite.';

// Deduplicación en memoria de IDs de mensajes ya procesados.
// YCloud puede reintentar el webhook; sin esto responderíamos el mismo mensaje varias veces.
// NOTA: en serverless las instancias no son estables, así que esto cubre los reintentos
// inmediatos sobre una instancia caliente. Para robustez total, persistir el message.id.
const MAX_PROCESSED_IDS = 500;

@Injectable()
export class WhatsAppService {
  private readonly processedMessageIds = new Set<string>();

  constructor(
    @Inject('ChatbotServiceInterface')
    private readonly chatbotService: ChatbotServiceInterface,
    @Inject(WHATSAPP_SENDER)
    private readonly sender: WhatsAppSenderInterface,
    private readonly configService: ConfigService,
    private readonly logger: MyLoggerService,
  ) {}

  /**
   * Procesa el evento entrante del webhook de YCloud.
   * Reusa el agente del glosario (ChatbotService) tratando el teléfono como sesión.
   * Solo actúa sobre `whatsapp.inbound_message.received`; los demás eventos se ignoran.
   */
  async processWebhook(payload: WhatsAppWebhookPayload): Promise<void> {
    if (payload?.type !== YCLOUD_INBOUND_MESSAGE_EVENT) {
      // Status updates, plantillas, cambios de cuenta, etc.: no nos interesan.
      return;
    }

    const message = payload.whatsappInboundMessage;
    if (!message) {
      return;
    }

    try {
      await this.handleMessage(message);
    } catch (error: any) {
      this.logger.error(
        `Error procesando mensaje de WhatsApp ${message?.id}: ${error.message}`,
        'WhatsAppService',
      );
    }
  }

  private async handleMessage(message: YCloudInboundMessage): Promise<void> {
    const { id: messageId, from, to, type, text } = message;

    if (!messageId || !from) {
      return;
    }

    if (this.isDuplicate(messageId)) {
      this.logger.log(`Mensaje de WhatsApp duplicado ignorado: ${messageId}`);
      return;
    }
    this.markProcessed(messageId);

    // Número del negocio (el que el cliente escribió). Es el `from` con el que
    // respondemos por YCloud; si faltara, caemos al configurado por env.
    const businessNumber =
      to || this.configService.get<string>('YCLOUD_FROM_PHONE') || '';

    if (type !== 'text' || !text?.body?.trim()) {
      await this.sender.sendText(businessNumber, from, NON_TEXT_REPLY);
      return;
    }

    // El teléfono del cliente es la identidad de la sesión: persiste el historial en Mongo
    // igual que en la web, manteniendo contexto entre mensajes.
    const sessionId = `whatsapp:${from}`;

    const result = await this.chatbotService.sendMessage({
      sessionId,
      userId: sessionId,
      message: text.body.trim(),
    });

    let reply = result.botResponse;
    if (result.action === ChatbotAction.CREATE_AD) {
      reply = `${result.botResponse}${CREATE_AD_WHATSAPP_HINT}`;
    }

    await this.sender.sendText(businessNumber, from, reply);
  }

  private isDuplicate(messageId: string): boolean {
    return this.processedMessageIds.has(messageId);
  }

  private markProcessed(messageId: string): void {
    this.processedMessageIds.add(messageId);
    // Acotar el Set para no crecer indefinidamente en una instancia caliente.
    if (this.processedMessageIds.size > MAX_PROCESSED_IDS) {
      const oldest = this.processedMessageIds.values().next().value;
      if (oldest) {
        this.processedMessageIds.delete(oldest);
      }
    }
  }
}
