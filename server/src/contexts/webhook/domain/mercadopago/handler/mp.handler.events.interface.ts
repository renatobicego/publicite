export interface MpHandlerEventsInterface {
  handleEvent_payment_update(dataID: string): Promise<boolean>;
  handleEvent_payment_create(dataID: string): Promise<boolean>;
  handleEvent_subscription_preapproval_create(dataID: string): Promise<boolean>;
  handleEvent_subscription_authorized_payment_update(
    dataID: string,
  ): Promise<boolean>;
  handleEvent_subscription_authorized_payment_create(
    dataID: string,
  ): Promise<boolean>;

  handleEvent_subscription_preapproval_updated(
    dataID: string,
  ): Promise<boolean>;
}
