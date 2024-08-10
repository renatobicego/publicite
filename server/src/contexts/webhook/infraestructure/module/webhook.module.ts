import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebhookService } from '../../application/webhook.service';
import { ClerkWebhookAdapter } from '../adapters/clerk-webhook.adapter';
import { WebhookController } from '../controllers/webhook.controller';
import { UserModule } from 'src/contexts/user/infraestructure/module/user.module';
import { UserService } from 'src/contexts/user/application/user.service';


@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot(),
  ],
  controllers: [WebhookController],
  providers: [
    {
      provide: 'UserServiceInterface',
      useClass: UserService,
    },
    WebhookService,
    {
      provide: ClerkWebhookAdapter,
      useFactory: (webhookService: WebhookService, configService: ConfigService) => {
        const WEBHOOK_SECRET = configService.get<string>('WEBHOOK_SECRET');
        if (!WEBHOOK_SECRET) {
          throw new Error('Please add WEBHOOK_SECRET to your environment variables');
        }
        return new ClerkWebhookAdapter(webhookService, WEBHOOK_SECRET);
      },
      inject: [WebhookService, ConfigService],
    },
  ],
})
export class WebhookModule { }
