export interface InvoiceAdapterInterface {
  getInvoicesByExternalReferenceId(id: string, page: number, limit: number): Promise<any>;
}
