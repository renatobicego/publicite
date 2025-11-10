import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { ChatbotResolver } from '../graphql/resolver/chatbot.resolver';
import { ChatbotAdapter } from '../adapter/chatbot.adapter';
import { ChatbotService } from '../../application/service/chatbot.service';
import { ChatbotRepository } from '../repository/chatbot.repository';
import { ChatbotAIService } from '../../domain/service/chatbot.ai.service';
import { ChatSessionSchema } from '../schemas/chatbot.schema';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'ChatSession',
        schema: ChatSessionSchema,
      },
    ]),
    ConfigModule.forRoot(),
  ],
  providers: [
    MyLoggerService,
    ChatbotResolver,
    {
      provide: 'ChatbotAdapterInterface',
      useClass: ChatbotAdapter,
    },
    {
      provide: 'ChatbotServiceInterface',
      useClass: ChatbotService,
    },
    {
      provide: 'ChatbotRepositoryInterface',
      useClass: ChatbotRepository,
    },
    {
      provide: 'ChatbotAIServiceInterface',
      useClass: ChatbotAIService,
    },
  ],
  exports: ['ChatbotServiceInterface', 'ChatbotRepositoryInterface'],
})
export class ChatbotModule {}

