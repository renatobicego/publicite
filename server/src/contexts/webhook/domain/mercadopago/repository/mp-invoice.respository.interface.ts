export interface MercadoPagoInvoiceRepositoryInterface {
  getInvoicesByExternalReference(external_reference: string): Promise<any[]>;
}
