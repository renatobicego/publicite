import Invoice from '../entity/invoice.entity';

export interface MercadoPagoInvoiceRepositoryInterface {
  saveInvoice(invoice: Invoice): Promise<void>;
  getInvoicesByExternalReference(external_reference: string): Promise<any[]>;
}
