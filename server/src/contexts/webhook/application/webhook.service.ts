import { Inject, Injectable } from '@nestjs/common';


import { WebhookEventInterface } from '../domain/webhook-event.interface';
import { WebhookServiceInterface } from '../domain/webhook-service.interface';
import { UserServiceInterface } from 'src/contexts/user/domain/user-service.interface';
/*
  se utiliza para marcar una clase como un "proveedor" que puede ser 
  inyectado en otras partes de la aplicación mediante el sistema de 
  inyección de dependencias
  Cuando necesitemos de esta clase para procesar un evento de webhook se inyectara ya que usamos @Injectable
*/
@Injectable()
export class WebhookService implements WebhookServiceInterface {

  constructor(
    @Inject('UserServiceInterface') private readonly userService: UserServiceInterface
  ) {}

  
  async processEvent(event: WebhookEventInterface): Promise<void> {
    const { object, type } = event;
    console.log(`Processing webhook Object: ${object} and type: ${type}`);
    
    switch (type) {
      case 'user.created':
        this.userService.createUser(event.data);
        break;
      default:
        console.log('Unknown event type:', type);
        break;
    }
  }
}
