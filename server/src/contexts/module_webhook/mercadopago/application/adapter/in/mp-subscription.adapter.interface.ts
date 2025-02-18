

export interface SubscriptionAdapterInterface {
  getSubscriptionHistory(
    external_reference: string,
  ): Promise<any[]>;
}
