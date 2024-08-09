import { Injectable } from '@nestjs/common';
import { WebhookEventInterface } from '../dominio/webhook-event.interface';
import { WebhookServiceInterface } from '../dominio/webhook-service.interface';







@Injectable()
/*
se utiliza para marcar una clase como un "proveedor" que puede ser 
inyectado en otras partes de la aplicación mediante el sistema de 
inyección de dependencias

Cuando necesitemos de esta clase para procesar un evento de webhook se inyectara ya que usamos @Injectable
*/
export class WebhookService implements WebhookServiceInterface {
  async processEvent(event: WebhookEventInterface): Promise<void> {
    const { id, type } = event;
    console.log(`Processing webhook with ID: ${id} and type: ${type}`);
    
  }
}
