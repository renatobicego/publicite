import Invoice from '../entity/invoice.entity';

export interface MercadoPagoInvoiceRepositoryInterface {
  saveInvoice(invoice: Invoice): Promise<void>;
  updateInvoice(
    subscription_authorized_payment_to_update: any,
    id: string,
  ): Promise<void>;
  getInvoicesByExternalReference(external_reference: string): Promise<any[]>;
}
