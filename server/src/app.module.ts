import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Asegúrate de importar ConfigModule
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { WebhookModule } from './contexts/webhook/infraestructure/module/webhook.module';
import { DatabaseModule } from './contexts/shared/database/infraestructure/database.module';
import { LoggerModule } from './contexts/shared/logger/logger.module';
import { UserModule } from './contexts/user/infraestructure/module/user.module';
import { AllExceptionsFilter } from './contexts/shared/exceptionFilter/infraestructure/exception.filter';
import { ContactModule } from './contexts/contact/infraestructure/module/contact.module';
import { SectorModule } from './contexts/businessSector/infraestructure/module/sector.module';
import { DatabaseService } from './contexts/shared/database/infraestructure/database.service';
import { PostModule } from './contexts/post/infraestructure/module/post.module';
import { BoardModule } from './contexts/board/infraestructure/module/user.module';

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    WebhookModule,
    UserModule,
    ContactModule,
    SectorModule,
    PostModule,
    BoardModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    DatabaseService,
  ],
})
export class AppModule {}
