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
 * Feature flags (para poder apagar límites nuevos si el cliente no los quiere):
 * - PRODUCTION_BLOG_LIMIT_ENABLED: activa el límite de CANTIDAD de blogs por
 *   usuario (personales y de grupo). Default: true. Si es false, no se aplica
 *   ningún tope de cantidad de blogs.
 * - PRODUCTION_STORAGE_LIMIT_ENABLED: activa el límite de ALMACENAMIENTO por
 *   usuario (suma de bytes de los archivos de todos sus blogs). Default: false
 *   (feature nueva, apagada por defecto). El límite en bytes se configura por
 *   plan en `subscriptionPlan.storageBytesLimit` (acumulativo entre suscripciones
 *   activas); el piso gratuito es `PRODUCTION_FREE_STORAGE_BYTES`.
 * - PRODUCTION_FREE_STORAGE_BYTES: piso de almacenamiento del plan gratuito, en
 *   BYTES (default 104857600 = 100 MB). Es el valor que recibe un usuario sin
 *   suscripciones activas o cuyos planes no tienen `storageBytesLimit` cargado.
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

/** Lee un flag booleano de env (`'true'`/`'false'`, case-insensitive). */
function readBoolean(envKey: string, defaultValue: boolean): boolean {
  const raw = process.env[envKey]?.trim().toLowerCase();
  if (raw === undefined || raw === '') return defaultValue;
  if (raw === 'true' || raw === '1') return true;
  if (raw === 'false' || raw === '0') return false;
  return defaultValue;
}

/** Default de bytes del piso gratuito de almacenamiento: 100 MB. */
const DEFAULT_FREE_STORAGE_BYTES = 100 * 1024 * 1024;

/**
 * ¿Está activo el límite de CANTIDAD de blogs por usuario? Si es false, se
 * habilita crear blogs sin tope (el gate de creación siempre permite).
 */
export function isBlogLimitEnabled(): boolean {
  return readBoolean('PRODUCTION_BLOG_LIMIT_ENABLED', true);
}

/**
 * ¿Está activo el límite de ALMACENAMIENTO (bytes) por usuario? Feature nueva,
 * apagada por defecto. Si es false, las subidas no validan ni contabilizan bytes.
 */
export function isStorageLimitEnabled(): boolean {
  return readBoolean('PRODUCTION_STORAGE_LIMIT_ENABLED', false);
}

/** Piso de almacenamiento del plan gratuito, en bytes (default 100 MB). */
export function getFreeStorageBytesLimit(): number {
  return readPositiveNumber(
    'PRODUCTION_FREE_STORAGE_BYTES',
    DEFAULT_FREE_STORAGE_BYTES,
  );
}

/** Formatea bytes a una unidad legible (para mensajes de error/UI). */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 MB';
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  const rounded = exponent === 0 ? value : Math.round(value * 10) / 10;
  return `${rounded} ${units[exponent]}`;
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

/**
 * Si está cargada la cuenta de Soonpublicité (alias o CBU). Sin ella no se
 * pueden vender tickets pagos: el comprador no sabría a dónde transferir.
 */
export function hasTicketTransferAccount(): boolean {
  const { alias, cbu } = getTicketTransferInfo();
  return !!(alias || cbu);
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
