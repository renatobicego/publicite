export interface MpServiceInvoiceInterface {
  getInvoicesByExternalReference(external_reference: string): Promise<any[]>;
}
