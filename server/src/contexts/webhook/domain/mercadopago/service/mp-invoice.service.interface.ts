export interface MpServiceInvoiceInterface {
  saveInvoice(subscription_authorized_payment: any): Promise<void>;
  getInvoicesByExternalReference(external_reference: string): Promise<any[]>;
}
