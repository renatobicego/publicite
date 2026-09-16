import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { printSchema } from 'graphql';
import * as dotenv from 'dotenv';

import { EmmiterModule } from 'src/contexts/module_shared/event-emmiter/emiter.module';
import { LoggerModule } from 'src/contexts/module_shared/logger/logger.module';
import { ProductionModule } from '../production/infraestructure/module/production.module';
import { ProductionResolver } from '../production/infraestructure/graphql/resolver/production.resolver';
import { ProductionAdminResolver } from '../production/infraestructure/graphql/resolver/production-admin.resolver';

// El ChatbotModule (importado por ProductionModule) usa `uuid`, que en la
// versión instalada es sólo ESM y Jest no lo transforma.
jest.mock('uuid', () => ({ v4: () => '00000000-0000-4000-8000-000000000000' }));

/**
 * Humo del módulo: `nest build` no valida ni la inyección de dependencias ni
 * el schema GraphQL code-first; los dos fallan recién al levantar la app.
 */
describe('Mis Producciones - módulo y schema GraphQL', () => {
  const RESOLVERS = [ProductionResolver, ProductionAdminResolver];

  it('genera el schema GraphQL con las operaciones del plan', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
    }).compile();
    await moduleRef.init();

    const schema = await moduleRef
      .get(GraphQLSchemaFactory)
      .create(RESOLVERS);
    const sdl = printSchema(schema);

    // Nombres fijados en plan-mis-producciones-01-BE.md para el contrato con la UI.
    for (const operation of [
      'createProduction',
      'updateProductionById',
      'deleteProductionById',
      'createFolder',
      'uploadFile',
      'updateFile',
      'deleteFile',
      'createArticle',
      'updateArticle',
      'deleteArticle',
      'findProductionById',
      'findAllProductionsByOwner',
      'getProductionConsumption',
    ]) {
      expect(sdl).toContain(`${operation}(`);
    }
    await moduleRef.close();
  });

  it('resuelve todas las dependencias del ProductionModule', async () => {
    dotenv.config({ path: '.env.test' });
    const moduleRef = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        EmmiterModule,
        LoggerModule,
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
        MongooseModule.forRootAsync({
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('DATABASE_URI'),
          }),
          inject: [ConfigService],
        }),
        ProductionModule,
      ],
    }).compile();

    for (const resolver of RESOLVERS) {
      expect(moduleRef.get(resolver)).toBeDefined();
    }
    expect(moduleRef.get('ProductionAdapterInterface')).toBeDefined();
    await moduleRef.close();
  });
});
