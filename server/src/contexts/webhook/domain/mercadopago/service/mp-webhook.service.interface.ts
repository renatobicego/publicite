export interface MpWebhookServiceInterface {
  createSubscription_preapproval(subscription_preapproval: any): Promise<void>;
  fetchData(url: string): Promise<any>;
  createSubscription_authorize_payment(
    subscription_authorized_payment: any,
  ): Promise<void>;
  create_payment(payment: any): Promise<void>;
  updateSubscription_preapproval(
    subscription_preapproval_update: any,
  ): Promise<void>;
  cancelSubscription_preapproval(id: string): Promise<void>;
}
