import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserModule } from 'src/contexts/module_user/user/infrastructure/module/user.module';
import { UserSchema } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { GroupSchema } from 'src/contexts/module_group/group/infrastructure/schemas/group.schema';
import ProductionModel from '../schemas/production.schema';
import ProductionItemModel, {
  PRODUCTION_ITEM_DISCRIMINATORS,
} from '../schemas/production-item.schema';
import { ProductionRepository } from '../repository/production.repository';
import { ProductionItemRepository } from '../repository/production-item.repository';
import ProductionAccessGrantModel from '../schemas/production-access-grant.schema';
import { ProductionAccessGrantRepository } from '../repository/production-access-grant.repository';
import { ProductionService } from '../../application/service/production.service';
import { ProductionInsightsService } from '../../application/service/production.insights.service';
import { ChatbotModule } from 'src/contexts/module_user/chatbot/infrastructure/module/chatbot.module';
import { ProductionAccessService } from '../../application/service/production.access.service';
import { ProductionCascadeService } from '../../application/service/production.cascade.service';
import { ProductionAdapter } from '../adapter/production.adapter';
import { ProductionResolver } from '../graphql/resolver/production.resolver';
import { ProductionAdminResolver } from '../graphql/resolver/production-admin.resolver';

/**
 * Mis Producciones (Desarrollo 3). Clona el patrón de module_post/post: DI por
 * token string, adapter entre resolver y service, factory por subtipo.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductionModel.modelName, schema: ProductionModel.schema },
      {
        name: ProductionItemModel.modelName,
        schema: ProductionItemModel.schema,
        // Los discriminators se registran sólo acá: Mongoose no permite
        // registrarlos dos veces en la misma conexión.
        discriminators: PRODUCTION_ITEM_DISCRIMINATORS,
      },
      {
        name: ProductionAccessGrantModel.modelName,
        schema: ProductionAccessGrantModel.schema,
      },
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
    ProductionAccessService,
    ProductionCascadeService,
    {
      provide: 'ProductionRepositoryInterface',
      useClass: ProductionRepository,
    },
    {
      provide: 'ProductionItemRepositoryInterface',
      useClass: ProductionItemRepository,
    },
    {
      provide: 'ProductionAccessGrantRepositoryInterface',
      useClass: ProductionAccessGrantRepository,
    },
    {
      provide: 'ProductionServiceInterface',
      useClass: ProductionService,
    },
    {
      provide: 'ProductionInsightsServiceInterface',
      useClass: ProductionInsightsService,
    },
    {
      provide: 'ProductionAdapterInterface',
      useClass: ProductionAdapter,
    },
  ],
  exports: ['ProductionServiceInterface'],
})
export class ProductionModule {}
