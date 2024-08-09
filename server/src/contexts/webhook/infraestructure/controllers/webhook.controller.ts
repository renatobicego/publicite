import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ClerkWebhookAdapter } from '../adapters/clerk-webhook.adapter';
import { ConfigService } from '@nestjs/config'; // Asegúrate de importar ConfigServic


@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly clerkWebhookAdapter: ClerkWebhookAdapter,
    private readonly configService: ConfigService, // Inyecta ConfigService
  ) { }

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: any,
    @Headers() headers: Record<string, string>
  ): Promise<void> {
    const WEBHOOK_SECRET = this.configService.get<string>('WEBHOOK_SECRET');
    
      //ngrok http --domain=regular-loved-hare.ngrok-free.app 3000
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
