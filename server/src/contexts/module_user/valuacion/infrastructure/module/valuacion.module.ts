import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ValuacionResolver } from '../graphql/resolver/valuacion.resolver';
import { ValuacionAdapter } from '../adapter/valuacion.adapter';
import { ValuacionService } from '../../application/service/valuacion.service';
import { ValuacionRepository } from '../repository/valuacion.repository';
import { ValuacionAIService } from '../../domain/service/valuacion.ai.service';
import { ValuacionSchema } from '../schemas/valuacion.schema';
import { ChatbotModule } from 'src/contexts/module_user/chatbot/infrastructure/module/chatbot.module';
import { PostModule } from 'src/contexts/module_post/post/infraestructure/module/post.module';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Valuacion', schema: ValuacionSchema }]),
    // Aporta ChatbotTokenServiceInterface: el gate y el cobro de tokens de IA
    // son los mismos que usa el chat, no se reimplementan acá.
    ChatbotModule,
    // Aporta PostRepositoryInterface: se usa para validar que el anuncio al que
    // se asocia una valuación sea del mismo usuario.
    PostModule,
  ],
  providers: [
    MyLoggerService,
    ValuacionResolver,
    {
      provide: 'ValuacionAdapterInterface',
      useClass: ValuacionAdapter,
    },
    {
      provide: 'ValuacionServiceInterface',
      useClass: ValuacionService,
    },
    {
      provide: 'ValuacionRepositoryInterface',
      useClass: ValuacionRepository,
    },
    {
      provide: 'ValuacionAIServiceInterface',
      useClass: ValuacionAIService,
    },
  ],
  exports: ['ValuacionServiceInterface'],
})
export class ValuacionModule {}
