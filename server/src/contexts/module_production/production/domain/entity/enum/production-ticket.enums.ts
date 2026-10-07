import { registerEnumType } from '@nestjs/graphql';

/**
 * Ciclo de vida de una compra de ticket (RNF-07):
 * pending → active → expired.
 *
 * - pending: el visitante avisó que hizo las dos transferencias (al blog y la
 *   comisión a Soonpublicité); falta que el staff del blog verifique la suya.
 * - active: el staff del blog verificó su transferencia y habilitó el acceso
 *   (TKT-07).
 * - expired: venció la duración o se cerró el blog (TKT-08).
 * - rejected: la transferencia al blog no llegó.
 * - cancelled: el blog se cerró antes de habilitar el acceso.
 */
export enum ProductionTicketPurchaseStatus {
  pending = 'pending',
  active = 'active',
  expired = 'expired',
  rejected = 'rejected',
  cancelled = 'cancelled',
}

registerEnumType(ProductionTicketPurchaseStatus, {
  name: 'ProductionTicketPurchaseStatus',
  description: 'pending → active → expired (+ rejected, cancelled)',
});

/**
 * Comisión que el comprador le transfiere a Soonpublicité (TKT-06). La
 * controla el admin de la plataforma, aparte del estado de la compra: una
 * comisión impaga suspende el acceso aunque la compra esté activa.
 */
export enum ProductionCommissionStatus {
  notApplicable = 'notApplicable',
  pending = 'pending',
  paid = 'paid',
  unpaid = 'unpaid',
}

registerEnumType(ProductionCommissionStatus, {
  name: 'ProductionCommissionStatus',
  description:
    'notApplicable (ticket gratuito), pending (a verificar), paid (cobrada), unpaid (impaga: el acceso queda suspendido)',
});

/** Estados en los que la compra sigue abierta (no se puede duplicar). */
export const OPEN_PURCHASE_STATUSES = [
  ProductionTicketPurchaseStatus.pending,
  ProductionTicketPurchaseStatus.active,
];
