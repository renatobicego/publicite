export interface MpServiceInvoiceInterface {
  saveInvoice(subscription_authorized_payment: any): Promise<void>;
  updateInvoice(
    subscription_authorized_payment_to_update: any,
    id: string,
  ): Promise<void>;
  getInvoicesByExternalReference(external_reference: string): Promise<any[]>;
}
