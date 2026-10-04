import { registerEnumType } from '@nestjs/graphql';

/**
 * Ciclo de vida de una compra de ticket (RNF-07):
 * pending → confirmed → active → expired.
 *
 * - pending: el visitante avisó que transfirió; falta que el admin lo verifique.
 * - confirmed: el admin verificó la transferencia (TKT-06).
 * - active: el admin o el creador habilitaron el acceso (TKT-07).
 * - expired: venció la duración o se cerró el blog (TKT-08).
 * - rejected: el admin no encontró la transferencia.
 * - cancelled: el blog se cerró antes de confirmar el pago.
 */
export enum ProductionTicketPurchaseStatus {
  pending = 'pending',
  confirmed = 'confirmed',
  active = 'active',
  expired = 'expired',
  rejected = 'rejected',
  cancelled = 'cancelled',
}

registerEnumType(ProductionTicketPurchaseStatus, {
  name: 'ProductionTicketPurchaseStatus',
  description: 'pending → confirmed → active → expired (+ rejected, cancelled)',
});

/** Liquidación del 90% al creador (TKT-06/11). */
export enum ProductionPayoutStatus {
  notApplicable = 'notApplicable',
  pending = 'pending',
  paid = 'paid',
}

registerEnumType(ProductionPayoutStatus, {
  name: 'ProductionPayoutStatus',
  description:
    'notApplicable (ticket gratuito o compra no confirmada), pending (a liquidar), paid (liquidado)',
});

/** Estados en los que la compra sigue abierta (no se puede duplicar). */
export const OPEN_PURCHASE_STATUSES = [
  ProductionTicketPurchaseStatus.pending,
  ProductionTicketPurchaseStatus.confirmed,
  ProductionTicketPurchaseStatus.active,
];
