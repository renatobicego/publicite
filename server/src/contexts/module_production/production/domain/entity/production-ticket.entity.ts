import {
  ProductionPayoutStatus,
  ProductionTicketPurchaseStatus,
} from './enum/production-ticket.enums';

/** Ticket de acceso a una carpeta, archivo o blog completo (TKT-01..03). */
export interface ProductionTicket {
  _id: string;
  production: string;
  target: string | null;
  isPaid: boolean;
  price: number;
  currency: string;
  durationHours: number | null;
  untilClose: boolean;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Compra de un ticket con su ciclo de vida (RNF-07). */
export interface ProductionTicketPurchase {
  _id: string;
  ticket: string;
  production: string;
  target: string | null;
  buyer: string;
  creator: string;
  status: ProductionTicketPurchaseStatus;
  isOpen: boolean;
  isPaid: boolean;
  amount: number;
  currency: string;
  commissionPercent: number;
  commissionAmount: number;
  creatorPayoutAmount: number;
  durationHours: number | null;
  untilClose: boolean;
  filesCount: number;
  productionTitle: string;
  targetName: string | null;
  payoutAliasCbu: string | null;
  acceptedNoRefund: boolean;
  acceptedAt: Date | null;
  transferReference: string | null;
  confirmedAt: Date | null;
  confirmedBy: string | null;
  activatedAt: Date | null;
  activatedBy: string | null;
  expiresAt: Date | null;
  expiredAt: Date | null;
  rejectedAt: Date | null;
  rejectedBy: string | null;
  statusReason: string | null;
  facturaUrl: string | null;
  facturaUploadedAt: Date | null;
  facturaUploadedBy: string | null;
  payoutStatus: ProductionPayoutStatus;
  payoutAt: Date | null;
  payoutBy: string | null;
  reviewRequired: boolean;
  firstAccessAt: Date | null;
  reviewedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const idOf = (value: any): string | null =>
  value ? value._id?.toString() ?? value.toString() : null;

export function ticketFromDocument(doc: any): ProductionTicket {
  return {
    _id: doc._id.toString(),
    production: idOf(doc.production)!,
    target: idOf(doc.target),
    isPaid: doc.isPaid,
    price: doc.price ?? 0,
    currency: doc.currency ?? 'ARS',
    durationHours: doc.durationHours ?? null,
    untilClose: !!doc.untilClose,
    createdBy: idOf(doc.createdBy)!,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function purchaseFromDocument(doc: any): ProductionTicketPurchase {
  return {
    ...doc,
    _id: doc._id.toString(),
    ticket: idOf(doc.ticket)!,
    production: idOf(doc.production)!,
    target: idOf(doc.target),
    buyer: idOf(doc.buyer)!,
    creator: idOf(doc.creator)!,
  };
}
