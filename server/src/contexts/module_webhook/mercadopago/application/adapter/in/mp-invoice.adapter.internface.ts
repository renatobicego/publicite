export interface InvoiceAdapterInterface {
  getInvoicesByExternalReferenceId(id: string, page: number, limit: number): Promise<any>;
  generateInvoiceTicket(invoiceId: string, userRequestId: string): Promise<Buffer>;
}
