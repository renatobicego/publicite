export interface InvoiceAdapterInterface {
  getInvoicesByExternalReference(reference: string): Promise<any[]>;
}
