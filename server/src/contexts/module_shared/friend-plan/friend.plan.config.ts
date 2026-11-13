/**
 * Configuración de los planes compartidos: regalos de planes y Hacete Amigo.
 * Todo por variables de entorno, con default.
 *
 * Regalos:
 * - PLAN_GIFT_MONTH_OPTIONS: meses que se pueden regalar, separados por coma
 *   (default "1,2,3,5", como pidió el cliente).
 *
 * Hacete Amigo:
 * - FRIEND_PLAN_DISCOUNT_TIERS: JSON {miembros: % de descuento}. El descuento de N
 *   miembros es el del mayor tramo <= N (default {"2":15,"3":20,"4":25,"5":30}).
 * - FRIEND_PLAN_MAX_DISCOUNT: tope final del descuento, en % (default 30).
 * - FRIEND_PLAN_MIN_MEMBERS: miembros aceptados mínimos para pagar (default 2).
 * - FRIEND_PLAN_MAX_MEMBERS: máximo de miembros; 0 = sin tope (default 0).
 * - FRIEND_PLAN_PAYMENT_FAILED_DAYS: días que puede quedar un grupo con el cobro
 *   rechazado antes de cancelarse (MP reintenta hasta 4 veces en 10 días; default 10).
 */

/** El webhook toma todo cobro de <= $50 como validación de tarjeta y lo ignora. */
export const MIN_CHARGE_AMOUNT = 51;

const DEFAULT_TIERS: Record<number, number> = { 2: 15, 3: 20, 4: 25, 5: 30 };

function readNumber(key: string, fallback: number, { min = 0 } = {}): number {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= min ? value : fallback;
}

export function getGiftMonthOptions(): number[] {
  const raw = process.env.PLAN_GIFT_MONTH_OPTIONS;
  const parsed = (raw ?? '1,2,3,5')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0 && value <= 24);
  return parsed.length > 0 ? Array.from(new Set(parsed)).sort((a, b) => a - b) : [1, 2, 3, 5];
}

export function getFriendPlanDiscountTiers(): Record<number, number> {
  const raw = process.env.FRIEND_PLAN_DISCOUNT_TIERS;
  if (!raw) return DEFAULT_TIERS;
  try {
    const parsed = JSON.parse(raw);
    const tiers: Record<number, number> = {};
    for (const [members, discount] of Object.entries(parsed)) {
      const count = Number(members);
      const percent = Number(discount);
      if (Number.isInteger(count) && count > 0 && Number.isFinite(percent) && percent >= 0) {
        tiers[count] = percent;
      }
    }
    return Object.keys(tiers).length > 0 ? tiers : DEFAULT_TIERS;
  } catch {
    return DEFAULT_TIERS;
  }
}

export const getFriendPlanMaxDiscount = () => readNumber('FRIEND_PLAN_MAX_DISCOUNT', 30);
export const getFriendPlanMinMembers = () => Math.max(2, readNumber('FRIEND_PLAN_MIN_MEMBERS', 2));
/** 0 = sin tope. */
export const getFriendPlanMaxMembers = () => readNumber('FRIEND_PLAN_MAX_MEMBERS', 0);
export const getFriendPlanPaymentFailedDays = () =>
  readNumber('FRIEND_PLAN_PAYMENT_FAILED_DAYS', 10, { min: 1 });

/** Descuento (en %) de un grupo de N miembros: el del mayor tramo <= N, con tope. */
export function friendPlanDiscountFor(memberCount: number): number {
  const tiers = getFriendPlanDiscountTiers();
  let discount = 0;
  for (const [members, percent] of Object.entries(tiers)) {
    if (Number(members) <= memberCount && percent > discount) discount = percent;
  }
  return Math.min(discount, getFriendPlanMaxDiscount());
}

/**
 * Precio de un grupo: cada miembro paga el plan con el descuento del tramo, y
 * quien paga abona el total de todos. Se calcula siempre en el server.
 */
export function friendPlanPricing(
  planAmount: number,
  memberCount: number,
): { discountPercent: number; pricePerMember: number; totalAmount: number } {
  const discountPercent = friendPlanDiscountFor(memberCount);
  const pricePerMember = Math.round(planAmount * (1 - discountPercent / 100));
  return {
    discountPercent,
    pricePerMember,
    totalAmount: pricePerMember * memberCount,
  };
}

/** Suma meses a una fecha sin pasarse al mes siguiente (31/1 + 1 mes = 28 o 29/2). */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}
