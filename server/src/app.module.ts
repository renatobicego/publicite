import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { GroupModule } from './contexts/module_group/group/infrastructure/module/group.module';
import { MagazineModule } from './contexts/module_magazine/magazine/infrastructure/module/magazine.module';
import { PostModule } from './contexts/module_post/post/infraestructure/module/post.module';
import { PostCategoryModule } from './contexts/module_post/postCategory/infrastructure/module/post.category.module';
import { DatabaseModule } from './contexts/module_shared/database/infrastructure/database.module';
import { AllExceptionsFilter } from './contexts/module_shared/exceptionFilter/infrastructure/exception.filter';
import { LoggerModule } from './contexts/module_shared/logger/logger.module';
import { NotificationSocketModule } from './contexts/module_socket/infrastructure/module/notification.socket.module';
import { BoardModule } from './contexts/module_user/board/infrastructure/module/board.module';
import { SectorModule } from './contexts/module_user/businessSector/infrastructure/module/sector.module';
import { ContactModule } from './contexts/module_user/contact/infrastructure/module/contact.module';
import { UserModule } from './contexts/module_user/user/infrastructure/module/user.module';
import { DatabaseService } from './contexts/module_shared/database/infrastructure/database.service';
import { MercadoPagoModule } from './contexts/module_webhook/mercadopago/infastructure/module/mercadopago.module';
import { ClerkModule } from './contexts/module_webhook/clerk/infrastructure/module/clerk.module';
import { NotificationModule } from './contexts/module_user/notification/infrastructure/module/notification.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ContactSellerModule } from './contexts/module_user/contactSeller/infrastructure/module/contactSeller.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      introspection: true,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    DatabaseModule,
    LoggerModule,
    ClerkModule,
    MercadoPagoModule,
    UserModule,
    ContactModule,
    SectorModule,
    PostModule,
    BoardModule,
    GroupModule,
    MagazineModule,
    PostCategoryModule,
    NotificationSocketModule,
    NotificationModule,
    ContactSellerModule,


  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    DatabaseService,
    NotificationSocketModule,
  ],
})
export class AppModule { }
