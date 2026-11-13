/**
 * Tipos de suscripción (`Subscription.kind`).
 *
 * - `mp`: suscripción de MercadoPago de un usuario. Es lo que había antes del
 *   campo, así que un documento sin `kind` se trata como `mp`.
 * - `carryover`: extra temporal interno al cambiar de plan. Apunta al plan viejo
 *   hasta su próximo cobro (`expiresAt`), sin cobro ni preapproval propio.
 * - `friendGroup`: suscripción compartida de Hacete Amigo. Un solo preapproval
 *   de MP y N titulares (cada miembro la tiene en `User.subscriptions`).
 * - `gift`: plan regalado. Meses prepagos con pago único, vence en `expiresAt`
 *   y no tiene preapproval de MP.
 */
export enum SubscriptionKind {
  MP = 'mp',
  CARRYOVER = 'carryover',
  FRIEND_GROUP = 'friendGroup',
  GIFT = 'gift',
}

export const SUBSCRIPTION_KINDS: string[] = Object.values(SubscriptionKind);

/** Kinds con un preapproval real en MercadoPago (se cancelan o pausan allá). */
export const MP_BACKED_SUBSCRIPTION_KINDS: SubscriptionKind[] = [
  SubscriptionKind.MP,
  SubscriptionKind.FRIEND_GROUP,
];

export function subscriptionKindOf(subscription: {
  kind?: string | null;
} | null | undefined): SubscriptionKind {
  const kind = subscription?.kind;
  return SUBSCRIPTION_KINDS.includes(kind as string)
    ? (kind as SubscriptionKind)
    : SubscriptionKind.MP;
}

export function isMpBackedSubscription(subscription: {
  kind?: string | null;
} | null | undefined): boolean {
  return MP_BACKED_SUBSCRIPTION_KINDS.includes(subscriptionKindOf(subscription));
}
