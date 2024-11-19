import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';



import { LoggerModule } from 'src/contexts/module_shared/logger/logger.module';
import { UserModule } from 'src/contexts/module_user/user/infrastructure/module/user.module';
import { WebhookService } from '../../application/clerkWebhook.service';
import { ClerkWebhookAdapter } from '../adapters/clerk-webhook.adapter';
import { ClerkController } from '../controllers/clerk.controller';


@Module({
  imports: [
    UserModule,
    LoggerModule,
  ],
  controllers: [
    ClerkController,
  ],
  providers: [
    // Proveedor para ClerkWebhookAdapter
    {
      provide: ClerkWebhookAdapter,
      useFactory: (
        webhookService: WebhookService,
        configService: ConfigService,
      ) => {
        const WEBHOOK_SECRET = configService.get<string>('WEBHOOK_SECRET');
        if (!WEBHOOK_SECRET) {
          throw new Error(
            'Please add WEBHOOK_SECRET to your environment variables',
          );
        }
        return new ClerkWebhookAdapter(webhookService, WEBHOOK_SECRET);
      },
      inject: [WebhookService, ConfigService], // Inyecta dependencias necesarias
    },
    WebhookService,
  ],
})
export class ClerkModule { }