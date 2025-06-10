export interface MpHandlerEventsInterface {
  create_payment(dataID: string): Promise<boolean>;

  create_subscription_preapproval(dataID: string): Promise<boolean>;


  update_payment(dataID: string): Promise<boolean>;
  update_subscription_preapproval(
    dataID: string,
  ): Promise<boolean>;

  update_subscription_authorized_payment(
    dataID: string,
  ): Promise<boolean>;
  create_subscription_authorized_payment(
    dataID: string,
  ): Promise<boolean>;


  //test_payment_notif(testType: string, userId: string): Promise<any>;



}
