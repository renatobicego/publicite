import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { WebhookModule } from './contexts/webhook/infrastructure/module/webhook.module';
import { LoggerModule } from './contexts/shared/logger/logger.module';
import { UserModule } from './contexts/user/infrastructure/module/user.module';
import { ContactModule } from './contexts/contact/infrastructure/module/contact.module';
import { SectorModule } from './contexts/businessSector/infrastructure/module/sector.module';
import { BoardModule } from './contexts/board/infrastructure/module/user.module';
import { PostModule } from './contexts/post/infraestructure/module/post.module';
import { AllExceptionsFilter } from './contexts/shared/exceptionFilter/infrastructure/exception.filter';
import { DatabaseModule } from './contexts/shared/database/infrastructure/database.module';
import { DatabaseService } from './contexts/shared/database/infrastructure/database.service';
import { GroupModule } from './contexts/group/infrastructure/module/group.module';

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
      introspection: true,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    WebhookModule,
    UserModule,
    ContactModule,
    SectorModule,
    PostModule,
    BoardModule,
    GroupModule,
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
