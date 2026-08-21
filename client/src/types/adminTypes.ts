import { PaymentMethod } from "./subscriptions";

/** Ticket visto desde el panel admin: los datos del pago + quién lo pagó. */
export interface AdminInvoice {
  _id: string;
  transactionAmount: number;
  paymentStatus: string;
  nextRetryDay: string | null;
  timeOfUpdate: string | null;
  status: string;
  reason: string | null;
  retryAttempts: number | null;
  rejectionCode: string | null;
  external_reference: string;
  invoice_id: string;
  currencyId: string | null;
  paymentId: PaymentMethod | null;
  userName: string;
  userEmail: string | null;
  userUsername: string | null;
  facturaUrl: string | null;
  facturaUploadedAt: string | null;
  facturaUploadedBy: string | null;
}

export interface AdminInvoiceFilters {
  userSearch?: string;
  userId?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  hasFactura?: boolean;
}

export interface AdminInvoiceResponse {
  invoices: AdminInvoice[];
  hasMore: boolean;
  total: number;
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  approved: "Aprobado",
  authorized: "Autorizado",
  pending: "En Proceso",
  rejected: "Rechazado",
  cancelled: "Pausado",
};
