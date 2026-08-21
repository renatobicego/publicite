import {
  AdminInvoice,
  AdminInvoiceGetAllResponse,
} from '../graphql_models/response/admin-invoice.model.graphql';
import { AdminInvoiceFilters } from '../repository/mp-invoice.respository.interface';

export interface MpServiceInvoiceInterface {
  saveInvoice(subscription_authorized_payment: any): Promise<{ payment: any, subscription: any, paymentReady: boolean } | null>;
  updateInvoice(
    subscription_authorized_payment_to_update: any,
    id: string,
  ): Promise<void>;

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
