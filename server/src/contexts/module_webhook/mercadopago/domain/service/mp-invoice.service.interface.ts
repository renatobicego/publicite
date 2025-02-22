

export interface MpServiceInvoiceInterface {
  saveInvoice(subscription_authorized_payment: any): Promise<{ payment: any, subscription: any, paymentReady: boolean } | null>;
  updateInvoice(
    subscription_authorized_payment_to_update: any,
    id: string,
  ): Promise<void>;

  getInvoicesByExternalReferenceId(id: string, page: number, limit: number): Promise<any>;
}
