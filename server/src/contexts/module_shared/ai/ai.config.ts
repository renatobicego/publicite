/**
 * Configuración compartida de los servicios de IA (valuación y match).
 * El chatbot conserva sus constantes propias por compatibilidad.
 */

/** Modelo económico: texto sin imágenes. */
export const AI_TEXT_MODEL = 'gpt-4o-mini';

/** Modelo con capacidades de visión. Se usa sólo cuando hay imágenes o precisión crítica. */
export function getVisionModel(): string {
  const model = process.env.OPENAI_VISION_MODEL;
  return model && model.trim().length > 0 ? model.trim() : 'gpt-4o';
}

/**
 * Modelos de la Valuación IA (corre sobre el Agents SDK / Responses API).
 * gpt-5-mini y gpt-5.1 aceptan imágenes, así que no hace falta cambiar de
 * modelo cuando el brief trae fotos como pasaba con gpt-4o-mini/gpt-4o.
 */
export function getValuacionBriefModel(): string {
  const model = process.env.VALUACION_BRIEF_MODEL;
  return model && model.trim().length > 0 ? model.trim() : 'gpt-5-mini';
}

/** El informe final usa el modelo grande: es el número que el usuario publica. */
export function getValuacionResultModel(): string {
  const model = process.env.VALUACION_RESULT_MODEL;
  return model && model.trim().length > 0 ? model.trim() : 'gpt-5.1';
}

/**
 * Hosts permitidos para las URLs de imágenes que se mandan a OpenAI.
 *
 * Sin allowlist, cualquiera podría pasar una URL arbitraria por la API y usar
 * nuestro backend como proxy de descarga hacia servicios internos o de terceros.
 * Los defaults cubren UploadThing v7 (utfs.io y <appId>.ufs.sh), que es lo que
 * usa el front. Se amplía con UPLOADTHING_ALLOWED_HOSTS (lista separada por comas).
 */
const DEFAULT_ALLOWED_IMAGE_HOSTS = ['utfs.io', 'ufs.sh'];

function getAllowedImageHosts(): string[] {
  const raw = process.env.UPLOADTHING_ALLOWED_HOSTS;
  if (!raw || !raw.trim()) return DEFAULT_ALLOWED_IMAGE_HOSTS;
  const hosts = raw
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  return hosts.length ? hosts : DEFAULT_ALLOWED_IMAGE_HOSTS;
}

/** true si la URL es https y su host está en la allowlist (o es subdominio de uno). */
export function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    return getAllowedImageHosts().some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`),
    );
  } catch {
    return false;
  }
}

/**
 * Filtra y limita las URLs de imágenes de una request.
 * @throws si alguna URL no pasa la allowlist (falla explícito: es preferible que
 *         el usuario sepa que su imagen fue rechazada a que la IA analice menos).
 */
export function sanitizeImageUrls(
  urls: string[] | undefined,
  maxImages: number,
): string[] {
  if (!urls || urls.length === 0) return [];

  const invalid = urls.filter((url) => !isAllowedImageUrl(url));
  if (invalid.length > 0) {
    throw new Error(
      'Sólo se aceptan imágenes subidas a Publicité. Volvé a cargarlas desde el panel de referencias.',
    );
  }

  // Deduplicar conservando el orden en que las cargó el usuario.
  return Array.from(new Set(urls)).slice(0, maxImages);
}

export function getMaxValuacionImages(): number {
  const raw = Number(process.env.VALUACION_MAX_IMAGES);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 10;
}

export function getMaxMatchImages(): number {
  const raw = Number(process.env.MATCH_MAX_IMAGES);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 4;
}

/**
 * Extrae el primer objeto JSON de una respuesta del modelo. Aunque se pida
 * response_format json_object, conviene tolerar que venga envuelto en ```json.
 */
export function parseJsonFromModel<T = any>(content: string | null | undefined): T {
  if (!content) throw new Error('La IA no devolvió contenido');

  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    throw new Error('La IA no devolvió un JSON válido');
  }
}
