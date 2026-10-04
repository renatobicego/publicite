/** Eventos de notificación de tickets de Mis Producciones. */
export enum ProductionTicketNotificationEvent {
  /** Compra de un ticket pago: la transferencia espera confirmación. */
  purchased = 'notification_production_ticket_purchased',
  /** El admin confirmó la transferencia; falta habilitar el acceso. */
  confirmed = 'notification_production_ticket_confirmed',
  /** Acceso habilitado. */
  activated = 'notification_production_ticket_activated',
  rejected = 'notification_production_ticket_rejected',
  /** Soonpublicité liquidó al creador su parte. */
  payoutDone = 'notification_production_ticket_payout_done',
  /** Se cargó la factura de la comisión. */
  facturaAttached = 'notification_production_ticket_factura_attached',
}

/** A quién le habla la notificación: cambia el texto y el link. */
export type ProductionTicketNotificationAudience = 'buyer' | 'staff' | 'admin';

export interface ProductionTicketNotificationFrontData {
  audience: ProductionTicketNotificationAudience;
  purchaseId: string;
  productionId: string;
  productionTitle: string;
  targetId: string | null;
  targetName: string | null;
  amount: number;
  currency: string;
  creatorPayoutAmount: number | null;
  commissionAmount: number | null;
  reason: string | null;
}

export interface ProductionTicketNotificationPayload {
  event: ProductionTicketNotificationEvent;
  recipients: {
    userId: string;
    audience: ProductionTicketNotificationAudience;
  }[];
  data: Omit<ProductionTicketNotificationFrontData, 'audience'>;
}

/** Remitente de las notificaciones que genera el sistema (no un usuario). */
export const PRODUCTION_TICKET_NOTIFICATION_SENDER =
  'Publicite production tickets';
