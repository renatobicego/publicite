export interface MpWebhookServiceInterface {
  subscription_preapproval_create(subscription_preapproval: any): Promise<void>;
  subscription_preapproval_update(
    subscription_preapproval_update: any,
  ): Promise<void>;

  subscription_authorize_payment_create(
    subscription_authorized_payment: any,
  ): Promise<void>;
  subscription_authorize_payment_update(
    subscription_authorized_payment: any,
  ): Promise<void>;
  create_payment(payment: any): Promise<void>;

  updatePayment(payment: any): Promise<void>;
  fetchPauseSuscription(url: string, preapproval_id: any): Promise<any>;
  fetchData(url: string): Promise<any>;
}
