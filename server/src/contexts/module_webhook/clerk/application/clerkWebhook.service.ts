import { Inject, Injectable } from '@nestjs/common';

import { WebhookEventInterface } from '../domain/webhook-event.interface';
import { UP_clerkUpdateRequestDto } from './dto/UP-clerk.update.request';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';
import { fullNameNormalization } from 'src/contexts/module_user/user/application/functions/fullNameNormalization';
import { WebhookServiceInterface } from '../domain/webhook-service.interface';

//import { User } from 'src/contexts/module_user/domain/entity/user.entity';
/*
  se utiliza para marcar una clase como un "proveedor" que puede ser 
  inyectado en otras partes de la aplicación mediante el sistema de 
  inyección de dependencias
  Cuando necesitemos de esta clase para procesar un evento de webhook se inyectara ya que usamos @Injectable
*/
@Injectable()
export class WebhookService implements WebhookServiceInterface {
  constructor(
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
  ) { }

  async processEvent(event: WebhookEventInterface): Promise<any> {
    const { object, type, data } = event;
    console.log(`Processing webhook Object: ${object} and type: ${type}`);

    switch (type) {
      case 'user.updated':
        const UP_clerkRequestUpdate: UP_clerkUpdateRequestDto =
          this.processData(data);
        return await this.userService.updateUserByClerkId(
          UP_clerkRequestUpdate,
        );
      case 'user.deleted':
        return type;
      default:
        console.log('Unknown event type:', type);
        break;
    }
  }

  processData(data: any): UP_clerkUpdateRequestDto {
    const { first_name, last_name, username, image_url, email_addresses, id } =
      data;
    const email = email_addresses[0].email_address;
    const finder = fullNameNormalization(first_name, last_name);
    const UP_clerkRequestUpdate: UP_clerkUpdateRequestDto = {
      clerkId: id,
      name: first_name,
      lastName: last_name,
      username: username,
      profilePhotoUrl: image_url,
      email: email,
      finder: finder,
    };
    return UP_clerkRequestUpdate;
  }
}
