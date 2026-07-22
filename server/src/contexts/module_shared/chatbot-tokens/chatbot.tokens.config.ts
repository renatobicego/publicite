/**
 * Configuración del sistema de tokens de IA ("tokens Publicité").
 *
 * Unidad interna de cuenta: tokens reales de OpenAI (input + output), enteros.
 * Unidad visible al usuario: "tokens Publicité"; 1 token Publicité equivale a
 * CHATBOT_TOKENS_RATIO tokens reales. Toda la persistencia se hace en tokens
 * reales y la conversión ocurre sólo al exponer datos al front.
 *
 * Las cantidades se definen por variables de entorno (los planes NO guardan
 * tokens en Mongo) para poder ajustarlas sin tocar datos:
 *
 * - CHATBOT_TOKENS_RATIO: tokens reales de OpenAI por 1 token Publicité (default 1000).
 * - CHATBOT_TOKENS_PLAN_DEFAULT: tokens Publicité BRUTOS por mes de un plan pago
 *   sin mapping explícito (default 1000).
 * - CHATBOT_TOKENS_PLAN_MAP: JSON opcional que mapea `mpPreapprovalPlanId` o
 *   `reason` (en minúsculas) a tokens Publicité brutos.
 *   Ej: {"2c93808496...": 2000, "plan oro": 3000}
 * - CHATBOT_TOKENS_COMMUNITY_SHARE: porcentaje del bruto que se acredita a la
 *   bolsa comunitaria (default 20). El usuario ve y recibe únicamente el neto;
 *   el split es interno y no se expone nunca en la API.
 * - CHATBOT_TOKENS_FREE_MONTHLY: tokens Publicité por mes para usuarios
 *   registrados sin plan pago (default 100). Salen de la bolsa comunitaria.
 * - CHATBOT_TOKENS_ANON_DAILY: tokens Publicité por día para usuarios no
 *   registrados, web o WhatsApp (default 15). Salen de la bolsa comunitaria.
 * - CHATBOT_TOKENS_IMAGE_FALLBACK: tokens Publicité a cobrar por imagen generada
 *   cuando OpenAI no informa usage (default 5).
 * - CHATBOT_TOKENS_COMMUNITY_BONUS_MONTHLY: tokens Publicité que la plataforma
 *   aporta a la bolsa comunitaria cada mes además del share de los planes
 *   (default 0). Útil para que usuarios free/anónimos puedan usar la IA aun
 *   sin suscripciones pagas activas (ej. al lanzar la feature).
 * - CHATBOT_TOKENS_COMMUNITY_SEED: base histórica ACUMULADA de tokens Publicité
 *   que la plataforma carga a la bolsa comunitaria (ej. el crédito comprado en
 *   OpenAI convertido a tokens Publicité). Se acredita una sola vez de forma
 *   idempotente; si el número sube (nueva compra de crédito), se acredita sólo
 *   la diferencia. Default 0.
 * - CHATBOT_USAGE_REPORT_KEY: clave para consultar el reporte de consumo
 *   (query getChatbotUsageReport). Si no está definida, el reporte queda
 *   deshabilitado.
 */

export interface PlanTokenRef {
  mpPreapprovalPlanId?: string;
  reason?: string;
  isFree?: boolean;
  isPack?: boolean;
}

function readPositiveNumber(envKey: string, defaultValue: number): number {
  const raw = process.env[envKey];
  if (!raw) return defaultValue;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return defaultValue;
  return parsed;
}

function readPlanMap(): Record<string, number> {
  const raw = process.env.CHATBOT_TOKENS_PLAN_MAP;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const map: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed)) {
      const amount = Number(value);
      if (Number.isFinite(amount) && amount >= 0) {
        map[key.toLowerCase().trim()] = amount;
      }
    }
    return map;
  } catch {
    console.warn(
      'CHATBOT_TOKENS_PLAN_MAP no es un JSON válido; se ignora el mapping por plan',
    );
    return {};
  }
}

export function getChatbotTokensRatio(): number {
  const ratio = readPositiveNumber('CHATBOT_TOKENS_RATIO', 1000);
  return ratio > 0 ? ratio : 1000;
}

export function getCommunitySharePercent(): number {
  const share = readPositiveNumber('CHATBOT_TOKENS_COMMUNITY_SHARE', 20);
  return Math.min(share, 100);
}

/**
 * Tokens Publicité BRUTOS mensuales que otorga un plan. Los planes gratuitos no
 * otorgan tokens propios y los packs sólo los otorgan si tienen mapping explícito
 * (un pack de posts no es una suscripción de IA).
 */
export function getPlanGrossPubliciteTokens(plan: PlanTokenRef): number {
  if (!plan || plan.isFree) return 0;
  const map = readPlanMap();
  const byId = plan.mpPreapprovalPlanId
    ? map[plan.mpPreapprovalPlanId.toLowerCase().trim()]
    : undefined;
  if (byId !== undefined) return byId;
  const byReason = plan.reason ? map[plan.reason.toLowerCase().trim()] : undefined;
  if (byReason !== undefined) return byReason;
  if (plan.isPack) return 0;
  return readPositiveNumber('CHATBOT_TOKENS_PLAN_DEFAULT', 1000);
}

/**
 * Tokens Publicité NETOS mensuales de un plan: lo que el usuario ve y recibe.
 * El resto (share comunitario) se acredita a la bolsa de la plataforma.
 */
export function getPlanNetPubliciteTokens(plan: PlanTokenRef): number {
  const gross = getPlanGrossPubliciteTokens(plan);
  return Math.floor((gross * (100 - getCommunitySharePercent())) / 100);
}

/** Tokens Publicité del bruto de un plan que van a la bolsa comunitaria. */
export function getPlanCommunityPubliciteTokens(plan: PlanTokenRef): number {
  const gross = getPlanGrossPubliciteTokens(plan);
  return gross - getPlanNetPubliciteTokens(plan);
}

export function getFreeMonthlyPubliciteTokens(): number {
  return readPositiveNumber('CHATBOT_TOKENS_FREE_MONTHLY', 100);
}

export function getAnonDailyPubliciteTokens(): number {
  return readPositiveNumber('CHATBOT_TOKENS_ANON_DAILY', 15);
}

export function getImageFallbackPubliciteTokens(): number {
  return readPositiveNumber('CHATBOT_TOKENS_IMAGE_FALLBACK', 5);
}

export function getCommunityMonthlyBonusPubliciteTokens(): number {
  return readPositiveNumber('CHATBOT_TOKENS_COMMUNITY_BONUS_MONTHLY', 0);
}

/**
 * Base histórica acumulada de tokens Publicité cargada por la plataforma a la
 * bolsa comunitaria (crédito comprado en OpenAI, convertido). Acreditación
 * incremental idempotente: sólo se acredita lo que supere lo ya acreditado.
 */
export function getCommunitySeedPubliciteTokens(): number {
  return readPositiveNumber('CHATBOT_TOKENS_COMMUNITY_SEED', 0);
}

/** Clave del reporte de consumo; undefined = reporte deshabilitado. */
export function getUsageReportKey(): string | undefined {
  const key = process.env.CHATBOT_USAGE_REPORT_KEY;
  return key && key.trim().length > 0 ? key.trim() : undefined;
}

export function publiciteToRealTokens(publiciteTokens: number): number {
  return Math.round(publiciteTokens * getChatbotTokensRatio());
}

/** Conversión para mostrar: 2 decimales para que consumos chicos no queden en 0. */
export function realToPubliciteTokens(realTokens: number): number {
  return Math.round((realTokens / getChatbotTokensRatio()) * 100) / 100;
}
