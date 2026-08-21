import Invoice from '../../../mercadopago/domain/entity/invoice.entity';

/** Filtros del panel admin de tickets. Todos opcionales. */
export interface AdminInvoiceFilters {
  /** mongoId exacto del usuario (external_reference del invoice). */
  userId?: string;
  /** Búsqueda libre por nombre, apellido, usuario o email del pagador. */
  userSearch?: string;
  paymentStatus?: string;
  /** YYYY-MM-DD (inclusive). */
  dateFrom?: string;
  /** YYYY-MM-DD (inclusive). */
  dateTo?: string;
  /** true = sólo sin factura cargada, false = sólo con factura. */
  hasFactura?: boolean;
}

export interface AdminInvoicesPage {
  invoices: any[];
  total: number;
  hasMore: boolean;
}

export interface MercadoPagoInvoiceRepositoryInterface {
  saveInvoice(invoice: Invoice): Promise<void>;
  updateInvoice(
    subscription_authorized_payment_to_update: any,
    id: string,
  ): Promise<void>;

  getInvoicesByExternalReferenceId(id: string, page: number, limit: number): Promise<any>;

  getInvoiceByIdForTicket(invoiceId: string): Promise<any>;

  /** Panel admin: todos los invoices de todos los usuarios, paginados. */
  getAllInvoicesPaginated(
    page: number,
    limit: number,
    filters?: AdminInvoiceFilters,
  ): Promise<AdminInvoicesPage>;

  /** Panel admin: asocia (o reemplaza) la factura de un invoice. */
  attachFactura(
    invoiceId: string,
    facturaUrl: string,
    adminId: string,
  ): Promise<any>;

  /** Datos de contacto (nombre/email) de los usuarios dueños de los invoices. */
  getUsersByIds(userIds: string[]): Promise<any[]>;
}
