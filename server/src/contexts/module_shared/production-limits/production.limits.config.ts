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
