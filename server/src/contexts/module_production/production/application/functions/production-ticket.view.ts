import {
  ProductionTicket,
  ProductionTicketPurchase,
} from '../../domain/entity/production-ticket.entity';
import { ProductionTicketPurchaseStatus } from '../../domain/entity/enum/production-ticket.enums';
import {
  ProductionTicketBuyerResponse,
  ProductionTicketPaymentInstructionsResponse,
  ProductionTicketPurchaseResponse,
  ProductionTicketResponse,
  ProductionTicketStatsResponse,
} from '../../domain/entity/models_graphql/HTTP-RESPONSE/production-ticket.response';
import { ProductionTicketSummaryResponse } from '../../domain/entity/models_graphql/HTTP-RESPONSE/production.response';
import { getTicketTransferInfo } from 'src/contexts/module_shared/production-limits/production.limits.config';

export type PurchaseAudience = 'buyer' | 'staff' | 'admin';

export function toTicketSummary(
  ticket: ProductionTicket,
): ProductionTicketSummaryResponse {
  return {
    _id: ticket._id,
    isPaid: ticket.isPaid,
    price: ticket.price,
    currency: ticket.currency,
    durationHours: ticket.durationHours,
    untilClose: ticket.untilClose,
  };
}

export function toTicketResponse(
  ticket: ProductionTicket,
  extras: {
    targetName?: string | null;
    filesCount: number;
    stats?: ProductionTicketStatsResponse | null;
  },
): ProductionTicketResponse {
  return {
    ...toTicketSummary(ticket),
    production: ticket.production,
    target: ticket.target,
    targetName: extras.targetName ?? null,
    filesCount: extras.filesCount,
    stats: extras.stats ?? null,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}

export function buildPaymentInstructions(
  amount: number,
  currency: string,
  reference?: string | null,
): ProductionTicketPaymentInstructionsResponse {
  return {
    ...getTicketTransferInfo(),
    amount,
    currency,
    reference: reference ?? null,
  };
}

/**
 * Respuesta de una compra según quién la mira: el comprador no ve el reparto
 * ni el alias/CBU del creador; el staff ve su liquidación; el admin ve todo.
 */
export function toPurchaseResponse(
  purchase: ProductionTicketPurchase,
  audience: PurchaseAudience,
  buyerInfo?: ProductionTicketBuyerResponse | null,
): ProductionTicketPurchaseResponse {
  const isAdmin = audience === 'admin';
  const seesSplit = audience !== 'buyer';

  return {
    _id: purchase._id,
    ticket: purchase.ticket,
    production: purchase.production,
    productionTitle: purchase.productionTitle,
    target: purchase.target,
    targetName: purchase.targetName,
    buyer: purchase.buyer,
    buyerInfo:
      audience === 'buyer' || !buyerInfo
        ? null
        : { ...buyerInfo, email: isAdmin ? buyerInfo.email ?? null : null },
    creator: purchase.creator,
    status: purchase.status,
    statusReason: purchase.statusReason,
    isPaid: purchase.isPaid,
    amount: purchase.amount,
    currency: purchase.currency,
    commissionPercent: seesSplit ? purchase.commissionPercent : null,
    commissionAmount: seesSplit ? purchase.commissionAmount : null,
    creatorPayoutAmount: seesSplit ? purchase.creatorPayoutAmount : null,
    durationHours: purchase.durationHours,
    untilClose: purchase.untilClose,
    filesCount: purchase.filesCount,
    acceptedNoRefund: purchase.acceptedNoRefund,
    transferReference: purchase.transferReference,
    confirmedAt: purchase.confirmedAt,
    activatedAt: purchase.activatedAt,
    expiresAt: purchase.expiresAt,
    payoutAliasCbu: isAdmin ? purchase.payoutAliasCbu : null,
    payoutStatus: seesSplit ? purchase.payoutStatus : null,
    payoutAt: seesSplit ? purchase.payoutAt : null,
    facturaUrl: isAdmin ? purchase.facturaUrl : null,
    facturaUploadedAt: isAdmin ? purchase.facturaUploadedAt : null,
    reviewRequired: purchase.reviewRequired,
    reviewedAt: purchase.reviewedAt,
    paymentInstructions:
      audience === 'buyer' &&
      purchase.isPaid &&
      purchase.status === ProductionTicketPurchaseStatus.pending
        ? buildPaymentInstructions(
            purchase.amount,
            purchase.currency,
            purchase._id,
          )
        : null,
    createdAt: purchase.createdAt,
  };
}
