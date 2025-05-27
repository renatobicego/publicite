/*
        Se especifica como va a ser el evento de webhook,
        de esta manera recibiremos los datos
*/
export interface WebhookEventInterface {
  object: string;
  type: string;
  data: any;
}
