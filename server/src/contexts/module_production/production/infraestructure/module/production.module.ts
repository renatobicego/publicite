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
import { ProductionService } from '../../application/service/production.service';
import { ProductionAccessService } from '../../application/service/production.access.service';
import { ProductionCascadeService } from '../../application/service/production.cascade.service';
import { ProductionAdapter } from '../adapter/production.adapter';
import { ProductionResolver } from '../graphql/resolver/production.resolver';

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
      { name: 'User', schema: UserSchema },
      { name: 'Group', schema: GroupSchema },
    ]),
    // OJO: no agregar ConfigModule.forRoot() acá (carga `.env` de prod y pisa
    // la config de QA); el ConfigModule global ya está en app.module.
    UserModule,
  ],
  providers: [
    MyLoggerService,
    ProductionResolver,
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
      provide: 'ProductionServiceInterface',
      useClass: ProductionService,
    },
    {
      provide: 'ProductionAdapterInterface',
      useClass: ProductionAdapter,
    },
  ],
  exports: ['ProductionServiceInterface'],
})
export class ProductionModule {}
