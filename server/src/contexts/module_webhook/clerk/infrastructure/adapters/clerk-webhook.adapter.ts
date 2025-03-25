import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Webhook } from 'svix';



import { WebhookEventInterface } from '../../domain/webhook-event.interface';
import { WebhookServiceInterface } from '../../domain/webhook-service.interface';
import { ConfigService } from '@nestjs/config';



/*
  Esta capa actua como intermediaria de la interacción con la API de Webhook de Clerk.
  La principal responabilidad de esta capa es interceptar los eventos de webhook 

*/
@Injectable()
export class ClerkWebhookAdapter {
  constructor(
    private readonly webhookService: WebhookServiceInterface,
    private readonly webhookSecret: string,
    private readonly configService: ConfigService
  ) { }


  async validateRequestAndProcessEvent(payload: any, headers: any): Promise<void> {
    const event = this.validateRequest(payload, headers);

    const userUpdated = await this.webhookService.processEvent(event);
    if (userUpdated == "user.deleted") {
      await this.deleteAccount(event.data.id);
    }
    return userUpdated;
  }

  private validateRequest(payload: any, headers: any): WebhookEventInterface {
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
      return evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEventInterface;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      throw new UnauthorizedException('Invalid webhook signature');
    }

  }

  private async deleteAccount(id: string) {
    const PUBLICITE_SOCKET_API_KEY = this.configService.get<string>('PUBLICITE_SOCKET_API_KEY');
    const config = {
      userService: this.configService.get<string>('DELETE_ACCOUNT_USER_SERVICE'),
      groupService: this.configService.get<string>('DELETE_ACCOUNT_GROUP_SERVICE'),
      notificationService: this.configService.get<string>('DELETE_ACCOUNT_NOTIFICATION_SERVICE'),
      postService: this.configService.get<string>('DELETE_ACCOUNT_POST_SERVICE')
    };

    const fetchOptions = {
      method: 'DELETE',
      headers: {
        'Authorization': `${PUBLICITE_SOCKET_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    try {

      const userResponse = await fetch(`${config.userService}/${id}`, fetchOptions);
      const userData = await userResponse.json();

      const mongoId = userData?.mongoID?._id;
      if (!mongoId) {
        throw new Error('Error while deleting account: MongoDB ID not found');
      }

      await fetch(`${config.groupService}/${mongoId}`, fetchOptions)

      await fetch(`${config.notificationService}/${mongoId}`, fetchOptions)
      
      await fetch(`${config.postService}/${mongoId}`, fetchOptions)

    } catch (error) {
      throw new Error(`Failed to delete account: ${error.message}`);
    }
  }

}
