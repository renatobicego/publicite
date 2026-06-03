import { Inject, Injectable } from '@nestjs/common';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { ChatbotServiceInterface } from 'src/contexts/module_user/chatbot/domain/service/chatbot.service.interface';
import { ChatbotAction } from 'src/contexts/module_user/chatbot/domain/entity/enum/chatbot.action.enum';
import {
  WhatsAppSenderInterface,
  WHATSAPP_SENDER,
} from '../adapter/out/whatsapp.sender.interface';
import { WhatsAppWebhookPayload } from '../../domain/entity/whatsapp-webhook.payload';

// Copy que se agrega cuando el agente detecta intención de crear un anuncio.
// En la web esto abre un formulario; en WhatsApp no hay UI, así que mandamos el link.
const CREATE_AD_LINK = 'https://soonpublicite.com/crear/anuncio';
const CREATE_AD_WHATSAPP_HINT = `\n\n👉 Creá tu anuncio acá: ${CREATE_AD_LINK}`;

const NON_TEXT_REPLY =
  'Por ahora solo puedo responder mensajes de texto 🙂. Escribime tu consulta sobre Publicite.';

// Deduplicación en memoria de IDs de mensajes ya procesados.
// Meta reintenta los webhooks; sin esto responderíamos el mismo mensaje varias veces.
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
    private readonly logger: MyLoggerService,
  ) {}

  /**
   * Procesa el payload entrante del webhook de WhatsApp.
   * Reusa el agente del glosario (ChatbotService) tratando el teléfono como sesión.
   */
  async processWebhook(payload: WhatsAppWebhookPayload): Promise<void> {
    const changes = payload?.entry?.flatMap((entry) => entry.changes ?? []) ?? [];

    for (const change of changes) {
      const messages = change?.value?.messages ?? [];

      // Los eventos de 'statuses' (entregado/leído) no traen 'messages': se ignoran.
      for (const message of messages) {
        try {
          await this.handleMessage(message.id, message.from, message.type, message.text?.body);
        } catch (error: any) {
          this.logger.error(
            `Error procesando mensaje de WhatsApp ${message?.id}: ${error.message}`,
            'WhatsAppService',
          );
        }
      }
    }
  }

  private async handleMessage(
    messageId: string,
    from: string,
    type: string,
    body?: string,
  ): Promise<void> {
    if (!messageId || !from) {
      return;
    }

    if (this.isDuplicate(messageId)) {
      this.logger.log(`Mensaje de WhatsApp duplicado ignorado: ${messageId}`);
      return;
    }
    this.markProcessed(messageId);

    if (type !== 'text' || !body?.trim()) {
      await this.sender.sendText(from, NON_TEXT_REPLY);
      return;
    }

    // El teléfono (wa_id) es la identidad de la sesión: persiste el historial en Mongo
    // igual que en la web, manteniendo contexto entre mensajes.
    const sessionId = `whatsapp:${from}`;

    const result = await this.chatbotService.sendMessage({
      sessionId,
      userId: sessionId,
      message: body.trim(),
    });

    let reply = result.botResponse;
    if (result.action === ChatbotAction.CREATE_AD) {
      reply = `${result.botResponse}${CREATE_AD_WHATSAPP_HINT}`;
    }

    await this.sender.sendText(from, reply);
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
