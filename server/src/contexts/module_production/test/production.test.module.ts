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
import {
  PRODUCTION_MODELS,
  PRODUCTION_PROVIDERS,
} from '../production/infraestructure/module/production.module.providers';

export const mockTokenService = {
  getStatusForUser: jest.fn(async () => ({
    hasActivePaidPlan: false,
    source: 'free',
    allowance: 100,
    used: 30,
    remaining: 70,
    communityTokensAvailable: true,
    resetsAt: new Date('2030-01-01T00:00:00Z'),
  })),
};

/**
 * Módulo de test de Mis Producciones. Usa `.env.test` (cluster QA, base
 * descartable `automated_tests`); nunca `.env`. Comparte modelos y providers
 * con el ProductionModule real.
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
        ...PRODUCTION_MODELS,
        { name: 'User', schema: UserSchema },
        { name: 'Group', schema: GroupSchema },
        { name: 'SubscriptionPlan', schema: SubscriptionPlanSchema },
        { name: 'Subscription', schema: SubscriptionSchema },
      ]),
      UserModule,
    ],
    providers: [
      MyLoggerService,
      ...PRODUCTION_PROVIDERS,
      {
        // El token bucket real depende de la config de OpenAI: acá se simula.
        provide: 'ChatbotTokenServiceInterface',
        useValue: mockTokenService,
      },
    ],
  }).compile();
};

const mapModuleTesting: Map<string, () => Promise<TestingModule>> = new Map([
  ['production', production_testing_module],
]);

export default mapModuleTesting;
