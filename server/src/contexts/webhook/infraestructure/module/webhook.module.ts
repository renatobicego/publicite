import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config'; // Importa ConfigService y ConfigModule
import { WebhookService } from '../../application/webhook.service';
import { ClerkWebhookAdapter } from '../adapters/clerk-webhook.adapter';
import { WebhookController } from '../controllers/webhook.controller';

@Module({
  imports: [ConfigModule], // Asegúrate de importar ConfigModule
  controllers: [WebhookController],
  providers: [
    WebhookService,
    {
      provide: ClerkWebhookAdapter,
      useFactory: (webhookService: WebhookService, configService: ConfigService) => {
        const WEBHOOK_SECRET = configService.get<string>('WEBHOOK_SECRET'); // Usa ConfigService para obtener la variable de entorno
        if (!WEBHOOK_SECRET) {
          throw new Error('Please add WEBHOOK_SECRET to your environment variables');
        }
        return new ClerkWebhookAdapter(webhookService, WEBHOOK_SECRET);
      },
      inject: [WebhookService, ConfigService], // Inyecta ConfigService en lugar de 'WEBHOOK_SECRET'
    },
  ],
})
export class WebhookModule { }
