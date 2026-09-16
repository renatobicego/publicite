import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserModule } from 'src/contexts/module_user/user/infrastructure/module/user.module';
import { ChatbotModule } from 'src/contexts/module_user/chatbot/infrastructure/module/chatbot.module';
import { UserSchema } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { GroupSchema } from 'src/contexts/module_group/group/infrastructure/schemas/group.schema';
import {
  PRODUCTION_MODELS,
  PRODUCTION_PROVIDERS,
} from './production.module.providers';
import { ProductionResolver } from '../graphql/resolver/production.resolver';
import { ProductionAdminResolver } from '../graphql/resolver/production-admin.resolver';
import { ProductionTicketResolver } from '../graphql/resolver/production-ticket.resolver';
import { ProductionSeudoBaseResolver } from '../graphql/resolver/production-seudobase.resolver';

/**
 * Mis Producciones (Desarrollo 3). Clona el patrón de module_post/post: DI por
 * token string, adapter entre resolver y service, factory por subtipo.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      ...PRODUCTION_MODELS,
      { name: 'User', schema: UserSchema },
      { name: 'Group', schema: GroupSchema },
    ]),
    // OJO: no agregar ConfigModule.forRoot() acá (carga `.env` de prod y pisa
    // la config de QA); el ConfigModule global ya está en app.module.
    UserModule,
    // Token bucket de IA para CONTROL Consumo (PC-05).
    ChatbotModule,
  ],
  providers: [
    MyLoggerService,
    ProductionResolver,
    ProductionAdminResolver,
    ProductionTicketResolver,
    ProductionSeudoBaseResolver,
    ...PRODUCTION_PROVIDERS,
  ],
  exports: ['ProductionServiceInterface'],
})
export class ProductionModule {}
