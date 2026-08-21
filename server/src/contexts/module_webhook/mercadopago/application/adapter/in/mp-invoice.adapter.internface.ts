import {
  AdminInvoice,
  AdminInvoiceGetAllResponse,
} from '../../../domain/graphql_models/response/admin-invoice.model.graphql';
import { AdminInvoiceFilters } from '../../../domain/repository/mp-invoice.respository.interface';

export interface InvoiceAdapterInterface {
  getInvoicesByExternalReferenceId(id: string, page: number, limit: number): Promise<any>;
  generateInvoiceTicket(
    invoiceId: string,
    userRequestId: string,
    isAdmin?: boolean,
  ): Promise<Buffer>;

  getAllInvoicesAdmin(
    page: number,
    limit: number,
    filters?: AdminInvoiceFilters,
  ): Promise<AdminInvoiceGetAllResponse>;

  attachFacturaToInvoice(
    invoiceId: string,
    facturaUrl: string,
    adminId: string,
  ): Promise<AdminInvoice>;
}
