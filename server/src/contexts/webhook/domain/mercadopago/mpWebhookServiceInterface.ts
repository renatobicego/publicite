import { dataType } from './objects';

export interface mpWebhookServiceInterface {
  processHeaders(request: any): dataType;
}
