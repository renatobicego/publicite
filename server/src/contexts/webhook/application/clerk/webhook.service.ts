import { Inject, Injectable } from '@nestjs/common';


import { WebhookEventInterface } from '../../domain/clerk/webhook-event.interface';
import { WebhookServiceInterface } from '../../domain/clerk/webhook-service.interface';
import { UserRepositoryInterface } from 'src/contexts/user/domain/user-service.interface';
import { CreateUserDto } from 'src/contexts/user/application/Dtos/create-user.dto';
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
        const createUserDto = new CreateUserDto(
          first_name,
          last_name,
          image_url
        );
        this.userService.createUser(createUserDto);
        break;
      default:
        console.log('Unknown event type:', type);
        break;
    }
  }




}
