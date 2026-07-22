import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatbotResolver } from '../graphql/resolver/chatbot.resolver';
import { ChatbotAdapter } from '../adapter/chatbot.adapter';
import { ChatbotService } from '../../application/service/chatbot.service';
import { ChatbotRepository } from '../repository/chatbot.repository';
import { ChatbotAIService } from '../../domain/service/chatbot.ai.service';
import { ChatbotTokenService } from '../../application/service/chatbot.token.service';
import { ChatbotTokenRepository } from '../repository/chatbot.token.repository';
import { ChatSessionSchema } from '../schemas/chatbot.schema';
import {
  ChatbotCommunityPoolSchema,
  ChatbotTokenAccountSchema,
  ChatbotTokenAccrualSchema,
  ChatbotUsageLogSchema,
} from '../schemas/chatbot.token.schema';
import { UserModel } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { SubscriptionSchema } from 'src/contexts/module_webhook/mercadopago/infastructure/schemas/subscription.schema';
import { SubscriptionPlanSchema } from 'src/contexts/module_webhook/mercadopago/infastructure/schemas/subscriptionPlan.schema';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'ChatSession',
        schema: ChatSessionSchema,
      },
      { name: 'ChatbotTokenAccount', schema: ChatbotTokenAccountSchema },
      { name: 'ChatbotCommunityPool', schema: ChatbotCommunityPoolSchema },
      { name: 'ChatbotTokenAccrual', schema: ChatbotTokenAccrualSchema },
      { name: 'ChatbotUsageLog', schema: ChatbotUsageLogSchema },
      // Modelos existentes que el sistema de tokens necesita leer para resolver
      // el plan activo del usuario y la acreditación de la bolsa comunitaria.
      { name: UserModel.modelName, schema: UserModel.schema },
      { name: 'Subscription', schema: SubscriptionSchema },
      { name: 'SubscriptionPlan', schema: SubscriptionPlanSchema },
    ]),
    // OJO: no agregar ConfigModule.forRoot() acá. El ConfigModule global (con
    // envFilePath según NODE_ENV) vive en app.module; un forRoot() pelado carga
    // `.env` (prod) a process.env y pisa la config de QA en desarrollo local.
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
    {
      provide: 'ChatbotTokenServiceInterface',
      useClass: ChatbotTokenService,
    },
    {
      provide: 'ChatbotTokenRepositoryInterface',
      useClass: ChatbotTokenRepository,
    },
  ],
  exports: [
    'ChatbotServiceInterface',
    'ChatbotRepositoryInterface',
    'ChatbotTokenServiceInterface',
  ],
})
export class ChatbotModule {}
