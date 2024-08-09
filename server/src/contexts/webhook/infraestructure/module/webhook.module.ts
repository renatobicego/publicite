import { Module } from '@nestjs/common';
import { WebhookService } from '../../application/webhook.service';
import { ClerkWebhookAdapter } from '../adapters/clerk-webhook.adapter';
import { WebhookController } from '../controllers/webhook.controller';


@Module({
  controllers: [WebhookController],
  providers: [
    WebhookService,
    {
      provide: 'WEBHOOK_SECRET',
      useValue: process.env.WEBHOOK_SECRET,
    },
    {
      provide: ClerkWebhookAdapter,
      useFactory: (webhookService: WebhookService, webhookSecret: string) => {
        return new ClerkWebhookAdapter(webhookService, webhookSecret);
      },
      inject: [WebhookService, 'WEBHOOK_SECRET'],
    },
  ],
})
export class WebhookModule {}
