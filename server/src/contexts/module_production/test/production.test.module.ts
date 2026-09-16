import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { EmmiterModule } from 'src/contexts/module_shared/event-emmiter/emiter.module';
import { LoggerModule } from 'src/contexts/module_shared/logger/logger.module';
import { UserModule } from 'src/contexts/module_user/user/infrastructure/module/user.module';
import { UserSchema } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { GroupSchema } from 'src/contexts/module_group/group/infrastructure/schemas/group.schema';
import { SubscriptionPlanSchema } from 'src/contexts/module_webhook/mercadopago/infastructure/schemas/subscriptionPlan.schema';
import { SubscriptionSchema } from 'src/contexts/module_webhook/mercadopago/infastructure/schemas/subscription.schema';
import ProductionModel from '../production/infraestructure/schemas/production.schema';
import ProductionItemModel, {
  PRODUCTION_ITEM_DISCRIMINATORS,
} from '../production/infraestructure/schemas/production-item.schema';
import { ProductionRepository } from '../production/infraestructure/repository/production.repository';
import { ProductionItemRepository } from '../production/infraestructure/repository/production-item.repository';
import { ProductionService } from '../production/application/service/production.service';
import { ProductionAccessService } from '../production/application/service/production.access.service';
import { ProductionCascadeService } from '../production/application/service/production.cascade.service';
import { ProductionAdapter } from '../production/infraestructure/adapter/production.adapter';

/**
 * Módulo de test de Mis Producciones. Usa `.env.test` (cluster QA, base
 * descartable `automated_tests`); nunca `.env`.
 */
const production_testing_module = async (): Promise<TestingModule> => {
  dotenv.config({ path: '.env.test' });

  return Test.createTestingModule({
    imports: [
      EventEmitterModule.forRoot(),
      EmmiterModule,
      LoggerModule,
      ConfigModule.forRoot({
        envFilePath: '.env.test',
        isGlobal: true,
      }),
      MongooseModule.forRootAsync({
        useFactory: async (configService: ConfigService) => ({
          uri: configService.get<string>('DATABASE_URI'),
        }),
        inject: [ConfigService],
      }),
      MongooseModule.forFeature([
        { name: ProductionModel.modelName, schema: ProductionModel.schema },
        {
          name: ProductionItemModel.modelName,
          schema: ProductionItemModel.schema,
          discriminators: PRODUCTION_ITEM_DISCRIMINATORS,
        },
        { name: 'User', schema: UserSchema },
        { name: 'Group', schema: GroupSchema },
        { name: 'SubscriptionPlan', schema: SubscriptionPlanSchema },
        { name: 'Subscription', schema: SubscriptionSchema },
      ]),
      UserModule,
    ],
    providers: [
      MyLoggerService,
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
  }).compile();
};

const mapModuleTesting: Map<string, () => Promise<TestingModule>> = new Map([
  ['production', production_testing_module],
]);

export default mapModuleTesting;
