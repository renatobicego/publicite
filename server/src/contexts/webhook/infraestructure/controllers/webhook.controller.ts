import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ClerkWebhookAdapter } from '../adapters/clerk-webhook.adapter';
import { WebhookService } from '../../application/webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly clerkWebhookAdapter: ClerkWebhookAdapter
  ) { }

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: any,
    @Headers() headers: Record<string, string>
  ): Promise<void> {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error('Please add WEBHOOK_SECRET to your environment variables');
    }

    await this.clerkWebhookAdapter.handleRequest(payload, headers);
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthTest(): Promise<{ status: string }> {
    return { status: 'Service ON' };
  }
}
