export interface SubscriptionAdapterInterface {
  deleteSubscription(id: string): Promise<void>;
  getSubscriptionHistory(external_reference: string): Promise<any[]>;
}
