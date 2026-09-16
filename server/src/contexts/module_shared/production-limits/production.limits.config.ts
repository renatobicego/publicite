/**
 * Configuración de los límites de "Mis Producciones" (MP).
 *
 * Los límites reales viven en el plan de suscripción (`subscriptionPlan.schema.ts`:
 * `personalBlogsCount`, `groupBlogsCount`, `filesPerBlogCount`) y son editables por
 * plan desde la DB (RNF-06). Este archivo define únicamente el **piso gratuito**:
 * lo que recibe un usuario sin suscripciones activas, o cuyos planes todavía no
 * tienen configuradas las dimensiones nuevas (planes creados antes de MP).
 *
 * Es un default seguro: nunca otorga más que el plan gratuito. En cuanto un plan
 * tenga las dimensiones cargadas, manda la DB.
 *
 * Variables de entorno (opcionales, todas con default):
 * - PRODUCTION_FREE_PERSONAL_BLOGS: blogs personales del plan gratuito (default 1).
 * - PRODUCTION_FREE_GROUP_BLOGS: blogs de grupo del plan gratuito (default 1).
 * - PRODUCTION_FREE_FILES_PER_BLOG: archivos por blog del plan gratuito (default 10).
 * - PRODUCTION_MAX_PERSONAL_BLOGS: tope duro de blogs personales para cualquier
 *   plan (default 1). PLN-02: el blog personal NO aumenta al mejorar de plan.
 *
 * Otros parámetros de MP:
 * - PRODUCTION_ACCESS_KEY_MAX_ATTEMPTS: intentos fallidos de clave antes de
 *   bloquear al usuario en ese blog (default 5).
 * - PRODUCTION_ACCESS_KEY_LOCK_MINUTES: minutos de bloqueo (default 15).
 * - PRODUCTION_TICKET_COMMISSION_PERCENT: comisión de Soonpublicité sobre los
 *   tickets pagos (default 10). El resto se liquida al creador (TKT-06).
 * - PRODUCTION_TICKET_MIN_DURATION_HOURS: duración mínima de un ticket
 *   (default 24, TKT-03).
 * - PRODUCTION_TICKETS_TRANSFER_ALIAS / _CBU / _HOLDER / _BANK: datos de la
 *   cuenta de Soonpublicité a la que el visitante transfiere (TKT-05).
 * - PRODUCTION_REPORTS_HIDE_THRESHOLD: denuncias pendientes que ocultan
 *   automáticamente un contenido hasta que un admin lo revise (default 3,
 *   DEN-02).
 */

function readPositiveNumber(envKey: string, defaultValue: number): number {
  const raw = process.env[envKey];
  if (!raw) return defaultValue;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return defaultValue;
  return Math.floor(parsed);
}

/** Blogs personales del plan gratuito. */
export function getFreePersonalBlogsLimit(): number {
  return readPositiveNumber('PRODUCTION_FREE_PERSONAL_BLOGS', 1);
}

/** Blogs de grupo del plan gratuito. */
export function getFreeGroupBlogsLimit(): number {
  return readPositiveNumber('PRODUCTION_FREE_GROUP_BLOGS', 1);
}

/** Archivos por blog del plan gratuito. */
export function getFreeFilesPerBlogLimit(): number {
  return readPositiveNumber('PRODUCTION_FREE_FILES_PER_BLOG', 10);
}

/**
 * Tope duro de blogs personales. El blog personal es 1 fijo en todos los planes
 * (PLN-01/PLN-02), así que el límite nunca se acumula entre suscripciones.
 */
export function getMaxPersonalBlogsLimit(): number {
  return readPositiveNumber('PRODUCTION_MAX_PERSONAL_BLOGS', 1);
}

/** Intentos fallidos de clave antes del bloqueo temporal. */
export function getAccessKeyMaxAttempts(): number {
  return Math.max(1, readPositiveNumber('PRODUCTION_ACCESS_KEY_MAX_ATTEMPTS', 5));
}

/** Minutos de bloqueo tras agotar los intentos de clave. */
export function getAccessKeyLockMinutes(): number {
  return readPositiveNumber('PRODUCTION_ACCESS_KEY_LOCK_MINUTES', 15);
}

/** Porcentaje de comisión de Soonpublicité sobre tickets pagos (0-100). */
export function getTicketCommissionPercent(): number {
  return Math.min(
    100,
    readPositiveNumber('PRODUCTION_TICKET_COMMISSION_PERCENT', 10),
  );
}

/** Duración mínima de un ticket en horas (TKT-03). */
export function getTicketMinDurationHours(): number {
  return Math.max(1, readPositiveNumber('PRODUCTION_TICKET_MIN_DURATION_HOURS', 24));
}

/** Denuncias pendientes que ocultan un contenido (DEN-02). */
export function getReportsHideThreshold(): number {
  return Math.max(1, readPositiveNumber('PRODUCTION_REPORTS_HIDE_THRESHOLD', 3));
}

/** Datos de la cuenta de Soonpublicité para las transferencias (TKT-05). */
export function getTicketTransferInfo(): {
  alias: string | null;
  cbu: string | null;
  holder: string | null;
  bank: string | null;
} {
  const read = (envKey: string) => process.env[envKey]?.trim() || null;
  return {
    alias: read('PRODUCTION_TICKETS_TRANSFER_ALIAS'),
    cbu: read('PRODUCTION_TICKETS_TRANSFER_CBU'),
    holder: read('PRODUCTION_TICKETS_TRANSFER_HOLDER'),
    bank: read('PRODUCTION_TICKETS_TRANSFER_BANK'),
  };
}
