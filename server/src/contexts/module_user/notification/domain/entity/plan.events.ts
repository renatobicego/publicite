/**
 * Notificaciones de planes compartidos: regalos de planes y Hacete Amigo.
 * Comparten un solo tipo (`plan_notifications`, discriminator NotificationPlan).
 * Ojo: el cliente elige el componente buscando un substring del evento, así que
 * ningún nombre lleva `payment`, `share`, `notification_group` ni `notification_user`.
 */
export enum PlanNotificationEvent {
  /** Al destinatario: X te regaló N meses de un plan. */
  giftReceived = 'notification_plan_gift_received',
  /** A quien regala: el destinatario activó el regalo. */
  giftActivated = 'notification_plan_gift_activated',
  /** Te invitaron a un grupo de Hacete Amigo. */
  friendInvited = 'notification_plan_friend_invited',
  /** Al creador: alguien aceptó o rechazó la invitación. */
  friendAccepted = 'notification_plan_friend_accepted',
  friendRejected = 'notification_plan_friend_rejected',
  /** A todos: ya están todos los miembros con algo publicado, se puede pagar. */
  friendReadyToPay = 'notification_plan_friend_ready_to_pay',
  /** A todos: el plan compartido quedó activo. */
  friendActive = 'notification_plan_friend_active',
  /** A todos: MP rechazó el cobro; a quien paga, que revise la tarjeta. */
  friendChargeFailed = 'notification_plan_friend_charge_failed',
  friendChargeRecovered = 'notification_plan_friend_charge_recovered',
  /** A todos: se canceló el grupo (alguien se fue, no se pudo cobrar, ...). */
  friendCancelled = 'notification_plan_friend_cancelled',
}

export type PlanNotificationKind = 'gift' | 'friendGroup';

export interface PlanNotificationFrontData {
  kind: PlanNotificationKind;
  /** id del regalo o del grupo. */
  entityId: string;
  /** Quién regala, quién invita o quién hizo la acción. */
  actorName: string | null;
  planReason: string | null;
  months: number | null;
  /** Motivo (cancelación de un grupo, por ejemplo). */
  reason: string | null;
  /** Para quien paga en Hacete Amigo: cambia el texto del rechazo. */
  isPayer: boolean | null;
}

export interface PlanNotificationPayload {
  event: PlanNotificationEvent;
  recipients: { userId: string; isPayer?: boolean }[];
  data: Omit<PlanNotificationFrontData, 'isPayer'>;
}

/** Remitente de las notificaciones que genera el sistema (no un usuario). */
export const PLAN_NOTIFICATION_SENDER = 'Publicite planes';
