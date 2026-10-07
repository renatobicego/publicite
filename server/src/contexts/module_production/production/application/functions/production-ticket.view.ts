import {
  ProductionTicket,
  ProductionTicketPurchase,
} from '../../domain/entity/production-ticket.entity';
import {
  ProductionCommissionStatus,
  ProductionTicketPurchaseStatus,
} from '../../domain/entity/enum/production-ticket.enums';
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
    target: ticket.target ?? null,
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

/** Transferencia de la comisión a la cuenta de Soonpublicité. */
export function buildCommissionPaymentInstructions(
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

const CBU_REGEX = /^\d{22}$/;

/** Transferencia de la parte del creador al alias/CBU del blog. */
export function buildCreatorPaymentInstructions(
  aliasCbu: string | null | undefined,
  amount: number,
  currency: string,
  reference?: string | null,
): ProductionTicketPaymentInstructionsResponse {
  const isCbu = !!aliasCbu && CBU_REGEX.test(aliasCbu);
  return {
    alias: isCbu ? null : aliasCbu ?? null,
    cbu: isCbu ? aliasCbu : null,
    holder: null,
    bank: null,
    amount,
    currency,
    reference: reference ?? null,
  };
}

/**
 * Respuesta de una compra según quién la mira: el staff ve sólo el
 * comprobante de su transferencia; el comprobante y la factura de la comisión
 * son del comprador y del admin; el admin ve todo.
 */
export function toPurchaseResponse(
  purchase: ProductionTicketPurchase,
  audience: PurchaseAudience,
  buyerInfo?: ProductionTicketBuyerResponse | null,
): ProductionTicketPurchaseResponse {
  const isAdmin = audience === 'admin';
  const isBuyer = audience === 'buyer';
  const seesCommission = audience !== 'staff';
  const isPending = purchase.status === ProductionTicketPurchaseStatus.pending;

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
    commissionPercent: purchase.commissionPercent,
    commissionAmount: purchase.commissionAmount,
    creatorPayoutAmount: purchase.creatorPayoutAmount,
    durationHours: purchase.durationHours,
    untilClose: purchase.untilClose,
    filesCount: purchase.filesCount,
    acceptedNoRefund: purchase.acceptedNoRefund,
    transferReference: purchase.transferReference,
    transferReceiptKey: purchase.transferReceiptKey ?? null,
    commissionReceiptKey: seesCommission
      ? purchase.commissionReceiptKey ?? null
      : null,
    commissionStatus:
      purchase.commissionStatus ?? ProductionCommissionStatus.notApplicable,
    commissionUpdatedAt: purchase.commissionUpdatedAt ?? null,
    activatedAt: purchase.activatedAt,
    expiresAt: purchase.expiresAt,
    payoutAliasCbu: isBuyer ? null : purchase.payoutAliasCbu,
    facturaUrl: seesCommission ? purchase.facturaUrl : null,
    facturaUploadedAt: seesCommission ? purchase.facturaUploadedAt : null,
    reviewRequired: purchase.reviewRequired,
    reviewedAt: purchase.reviewedAt,
    creatorPaymentInstructions:
      isBuyer && purchase.isPaid && isPending
        ? buildCreatorPaymentInstructions(
            purchase.payoutAliasCbu,
            purchase.creatorPayoutAmount,
            purchase.currency,
            purchase._id,
          )
        : null,
    // Con la comisión impaga el comprador tiene que poder pagarla para
    // recuperar el acceso.
    commissionPaymentInstructions:
      isBuyer &&
      purchase.isPaid &&
      (isPending ||
        purchase.commissionStatus === ProductionCommissionStatus.unpaid)
        ? buildCommissionPaymentInstructions(
            purchase.commissionAmount,
            purchase.currency,
            purchase._id,
          )
        : null,
    createdAt: purchase.createdAt,
  };
}
