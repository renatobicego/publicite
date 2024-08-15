import { Inject, Injectable } from '@nestjs/common';


import { WebhookEventInterface } from '../../domain/clerk/webhook-event.interface';
import { WebhookServiceInterface } from '../../domain/clerk/webhook-service.interface';

import { UserRepositoryInterface } from 'src/contexts/user/domain/user-repository.interface';
import { User } from 'src/contexts/user/domain/entity/user.entity';
/*
  se utiliza para marcar una clase como un "proveedor" que puede ser 
  inyectado en otras partes de la aplicación mediante el sistema de 
  inyección de dependencias
  Cuando necesitemos de esta clase para procesar un evento de webhook se inyectara ya que usamos @Injectable
*/
@Injectable()
export class WebhookService implements WebhookServiceInterface {

  constructor(
    @Inject('UserRepositoryInterface') private readonly userService: UserRepositoryInterface
  ) { }


  async processEvent(event: WebhookEventInterface): Promise<void> {
    const { object, type } = event;
    console.log(`Processing webhook Object: ${object} and type: ${type}`);


    switch (type) {
      case 'user.created':
        const { first_name, last_name, image_url } = event.data;
        const user = new User(
          first_name,
          last_name,
          image_url
        );
        this.userService.createUser(user);
        break;
      default:
        console.log('Unknown event type:', type);
        break;
    }
  }




}
