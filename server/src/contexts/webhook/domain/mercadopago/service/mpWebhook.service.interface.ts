export interface MpWebhookServiceInterface {
  createSubscription_preapproval(subscription_preapproval: any): Promise<void>;
  fetchData(url: string): Promise<any>;
  createSubscription_authorize_payment(
    subscription_authorized_payment: any,
  ): Promise<void>;
  create_payment(payment: any): Promise<void>;
  //setPayerIDtoUser(payerId: string, payerEmail: string): Promise<void>;
}
