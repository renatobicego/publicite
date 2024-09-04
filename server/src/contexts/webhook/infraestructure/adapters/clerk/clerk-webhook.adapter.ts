import { Injectable, UnauthorizedException } from '@nestjs/common';
import { WebhookEventInterface } from '../../../domain/clerk/webhook-event.interface';
import { Webhook } from 'svix';
import { WebhookServiceInterface } from '../../../domain/clerk/webhook-service.interface';
/*
  Esta capa actua como intermediaria de la interacción con la API de Webhook de Clerk.
  La principal responabilidad de esta capa es interceptar los eventos de webhook 

*/
@Injectable()
export class ClerkWebhookAdapter {
  constructor(
    private readonly webhookService: WebhookServiceInterface,
    private readonly webhookSecret: string,
  ) {}

  async handleRequest(payload: any, headers: any): Promise<void> {
    const svixId = headers['svix-id'];
    const svixTimestamp = headers['svix-timestamp'];
    const svixSignature = headers['svix-signature'];

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new UnauthorizedException('Invalid webhook headers');
    }

    const body = JSON.stringify(payload);
    const wh = new Webhook(this.webhookSecret);

    let evt: WebhookEventInterface;

    try {
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEventInterface;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      throw new UnauthorizedException('Invalid webhook signature');
    }

    await this.webhookService.processEvent(evt);
  }
}
