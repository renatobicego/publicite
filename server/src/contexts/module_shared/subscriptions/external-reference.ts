/**
 * `external_reference` de MercadoPago: a quién pertenece un preapproval o un
 * pago. Hoy es el mongoId del usuario; los flujos nuevos usan un prefijo:
 * `gift:<id>` (regalo), `friendGroup:<id>` (Hacete Amigo) y `mptest:<uuid>`
 * (pruebas de la Fase 0, nunca tocan usuarios ni límites).
 */
export const EXTERNAL_REFERENCE_PREFIX = {
  GIFT: 'gift:',
  FRIEND_GROUP: 'friendGroup:',
  TEST: 'mptest:',
} as const;

export type ResolvedExternalReference =
  | { type: 'user'; userId: string }
  | { type: 'gift'; id: string }
  | { type: 'friendGroup'; id: string }
  | { type: 'test'; id: string }
  | { type: 'unknown'; raw: string };

const MONGO_ID = /^[a-f0-9]{24}$/i;

export function resolveExternalReference(
  reference: string | null | undefined,
): ResolvedExternalReference {
  const raw = (reference ?? '').toString().trim();
  if (raw.startsWith(EXTERNAL_REFERENCE_PREFIX.GIFT)) {
    return { type: 'gift', id: raw.slice(EXTERNAL_REFERENCE_PREFIX.GIFT.length) };
  }
  if (raw.startsWith(EXTERNAL_REFERENCE_PREFIX.FRIEND_GROUP)) {
    return {
      type: 'friendGroup',
      id: raw.slice(EXTERNAL_REFERENCE_PREFIX.FRIEND_GROUP.length),
    };
  }
  if (raw.startsWith(EXTERNAL_REFERENCE_PREFIX.TEST)) {
    return { type: 'test', id: raw.slice(EXTERNAL_REFERENCE_PREFIX.TEST.length) };
  }
  if (MONGO_ID.test(raw)) return { type: 'user', userId: raw };
  return { type: 'unknown', raw };
}

/**
 * Usuario que paga una suscripción ya guardada: `payerUser` en las nuevas y,
 * en las anteriores al campo, el `external_reference` si es un mongoId.
 */
export function payerOfSubscription(subscription: any): string | null {
  if (subscription?.payerUser) return subscription.payerUser.toString();
  const resolved = resolveExternalReference(subscription?.external_reference);
  return resolved.type === 'user' ? resolved.userId : null;
}
