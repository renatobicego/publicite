import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ChatbotModule } from 'src/contexts/module_user/chatbot/infrastructure/module/chatbot.module';
import { WhatsAppController } from '../controllers/whatsapp.controller';
import { WhatsAppService } from '../../application/service/whatsapp.service';
import { WhatsAppSender } from '../../application/adapter/out/whatsapp.sender';
import { WHATSAPP_SENDER } from '../../application/adapter/out/whatsapp.sender.interface';

/**
 * Canal de WhatsApp (vía YCloud) para el agente del glosario.
 * Importa ChatbotModule (que exporta 'ChatbotServiceInterface') y lo expone vía webhook.
 * MyLoggerService está disponible globalmente (LoggerModule es @Global()).
 */
@Module({
  imports: [ChatbotModule, ConfigModule],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    {
      provide: WHATSAPP_SENDER,
      useClass: WhatsAppSender,
    },
  ],
})
export class WhatsAppModule {}
