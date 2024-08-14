import { WebhookEventInterface } from "./webhook-event.interface";
/*
  En esta interfaz definimos los metodos que se usaran para procesar los eventos de webhook.
  Como es una interfaz solo definimos los metodos que se usaran, no la implementacion.
*/



export interface WebhookServiceInterface {
  processEvent(event: WebhookEventInterface): Promise<void>;
}
