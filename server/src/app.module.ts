import { Module } from '@nestjs/common';
import { WebhookModule } from './contexts/webhook/infraestructure/module/webhook.module';


@Module({
  imports: [WebhookModule],
})
export class AppModule {}
