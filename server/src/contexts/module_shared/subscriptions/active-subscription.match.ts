import { SubscriptionKind, subscriptionKindOf } from './subscription.kind';

/** Estado de MercadoPago con el que una suscripción da los límites de su plan. */
export const ACTIVE_SUBSCRIPTION_STATUS = 'authorized';

/**
 * Filtro de Mongo para "suscripción activa": `authorized` y, si es temporal
 * (`expiresAt`, en extras de cambio de plan y regalos), todavía no vencida.
 *
 * Es el único lugar que define qué suscripción da límites: lo usan el cálculo
 * de anuncios, contactos, blogs, almacenamiento y tokens. El vencimiento se
 * evalúa al leer porque el server corre en Firebase Functions, sin tareas
 * programadas. `{ expiresAt: null }` también matchea los documentos sin el
 * campo (todas las suscripciones anteriores).
 *
 * Es una función para que la fecha se tome en cada consulta.
 */
export function activeSubscriptionMatch(now: Date = new Date()): Record<string, any> {
  return {
    status: ACTIVE_SUBSCRIPTION_STATUS,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  };
}

/** La misma regla que `activeSubscriptionMatch`, para un documento ya leído. */
export function isSubscriptionActive(
  subscription: { status?: string | null; expiresAt?: Date | string | null } | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!subscription || subscription.status !== ACTIVE_SUBSCRIPTION_STATUS) return false;
  if (!subscription.expiresAt) return true;
  return new Date(subscription.expiresAt).getTime() > now.getTime();
}

/**
 * ¿La suscripción es un plan pago "de verdad"? (no gratuito, no pack, no el
 * extra temporal de cambio de plan). Es lo que preguntan el checkout de un plan
 * individual, los regalos y Hacete Amigo. Espera el plan populado.
 */
export function isPaidPlanSubscription(subscription: any): boolean {
  const plan = subscription?.subscriptionPlan;
  if (!plan || typeof plan !== 'object') return false;
  if (plan.isFree || plan.isPack) return false;
  return subscriptionKindOf(subscription) !== SubscriptionKind.CARRYOVER;
}
