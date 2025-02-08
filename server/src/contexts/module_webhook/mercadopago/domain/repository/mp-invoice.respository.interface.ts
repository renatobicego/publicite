import Invoice from '../../../mercadopago/domain/entity/invoice.entity';

export interface MercadoPagoInvoiceRepositoryInterface {
  saveInvoice(invoice: Invoice): Promise<void>;
  updateInvoice(
    subscription_authorized_payment_to_update: any,
    id: string,
  ): Promise<void>;

  getInvoicesByExternalReferenceId(id: string, page: number, limit: number): Promise<any>;
}
