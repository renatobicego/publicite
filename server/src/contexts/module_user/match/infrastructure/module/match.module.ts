import { Module } from '@nestjs/common';

import { MatchResolver } from '../graphql/resolver/match.resolver';
import { MatchService } from '../../application/service/match.service';
import { MatchAIService } from '../../domain/service/match.ai.service';
import { PostModule } from 'src/contexts/module_post/post/infraestructure/module/post.module';
import { ChatbotModule } from 'src/contexts/module_user/chatbot/infrastructure/module/chatbot.module';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

/**
 * Match IA es stateless: no tiene schema ni repositorio propio.
 * - PostModule aporta PostRepositoryInterface (búsqueda de candidatos con el
 *   filtro de visibilidad ya resuelto).
 * - ChatbotModule aporta el gate y el cobro de tokens.
 */
@Module({
  imports: [PostModule, ChatbotModule],
  providers: [
    MyLoggerService,
    MatchResolver,
    {
      provide: 'MatchServiceInterface',
      useClass: MatchService,
    },
    {
      provide: 'MatchAIServiceInterface',
      useClass: MatchAIService,
    },
  ],
  // MatchAIServiceInterface se exporta para que Valuación reutilice la extracción
  // de criterios de búsqueda en vez de tener su propio extractor duplicado.
  exports: ['MatchServiceInterface', 'MatchAIServiceInterface'],
})
export class MatchModule {}
