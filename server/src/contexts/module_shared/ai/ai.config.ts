/**
 * Configuración compartida de los servicios de IA (chatbot, valuación y match).
 * Todos los modelos se pueden pisar por variable de entorno para poder cambiar
 * de modelo sin redeployar código.
 */

function readModel(envVar: string, fallback: string): string {
  const model = process.env[envVar];
  return model && model.trim().length > 0 ? model.trim() : fallback;
}

/**
 * Modelo económico de texto (chatbot y match).
 * gpt-6-luna sale más barato que gpt-4o-mini (US$0,10/US$0,50 por millón contra
 * US$0,15/US$0,60) y además acepta imágenes, así que ya no hace falta saltar a
 * un modelo con visión aparte.
 */
export function getTextModel(): string {
  return readModel('OPENAI_TEXT_MODEL', 'gpt-6-luna');
}

/**
 * Modelo para los flujos con imágenes. Hoy es el mismo que el de texto: la
 * familia gpt-6 tiene visión nativa y no hay motivo para pagar un modelo más
 * caro sólo porque el usuario adjuntó fotos. Se mantiene separado para poder
 * subirlo (ej. gpt-6-sol) si la precisión visual lo justifica.
 */
export function getVisionModel(): string {
  return readModel('OPENAI_VISION_MODEL', 'gpt-6-luna');
}

/** Modelo de generación y edición de imágenes del chatbot. */
export function getImageGenerationModel(): string {
  return readModel('OPENAI_IMAGE_MODEL', 'gpt-image-2.5-sunburst');
}

/**
 * Tope de caracteres del prompt de generación de imágenes. Lo usan el DTO y el
 * servicio; el cliente tiene el mismo valor en IMAGE_PROMPT_MAX_LENGTH
 * (client/src/utils/data/aiLimits.ts).
 */
export const IMAGE_PROMPT_MAX_LENGTH = 2000;

/**
 * Modelos de la Valuación IA (corre sobre el Agents SDK / Responses API).
 * La familia gpt-6 acepta imágenes, así que no hace falta cambiar de modelo
 * cuando el brief trae fotos como pasaba con gpt-4o-mini/gpt-4o.
 */
export function getValuacionBriefModel(): string {
  return readModel('VALUACION_BRIEF_MODEL', 'gpt-6-luna');
}

/** El informe final usa el modelo grande: es el número que el usuario publica. */
export function getValuacionResultModel(): string {
  return readModel('VALUACION_RESULT_MODEL', 'gpt-6-sol');
}

/**
 * Modelos que todavía aceptan la forma clásica de chat.completions
 * (`temperature` libre + `max_tokens`): gpt-4 y gpt-3.5.
 *
 * Se listan los viejos en lugar de los nuevos a propósito: así, si mañana se
 * apunta OPENAI_TEXT_MODEL a un modelo más nuevo por variable de entorno, se
 * asume la forma de razonamiento (que es hacia donde va la API) y no hay que
 * tocar código.
 */
function isLegacyChatModel(model: string): boolean {
  return /^(gpt-4|gpt-3)/.test(model.trim().toLowerCase());
}

/**
 * true si el modelo es de razonamiento (gpt-5, gpt-6, o-series y lo que venga).
 * Estos modelos NO aceptan los parámetros clásicos de chat.completions.
 */
export function isReasoningModel(model: string): boolean {
  return !isLegacyChatModel(model);
}

/**
 * Normaliza los parámetros de `chat.completions` según el modelo.
 *
 * Los modelos de razonamiento rechazan la forma clásica (verificado contra la
 * API):
 *  - `max_tokens` → hay que mandar `max_completion_tokens`.
 *  - `temperature` → sólo admiten el default (1); cualquier otro valor es un 400.
 *  - function tools → en chat.completions sólo funcionan con
 *    `reasoning_effort: 'none'` (si no, la API devuelve 400 y pide usar
 *    /v1/responses).
 *
 * Se fuerza `reasoning_effort: 'none'` en todas las llamadas: estos flujos
 * (chat del glosario, extracción de criterios, ranking) no necesitan cadena de
 * razonamiento, que se cobra como tokens de salida y además se comería el tope
 * de `max_completion_tokens` dejando la respuesta vacía.
 */
export function buildChatCompletionParams(params: {
  model: string;
  temperature: number;
  maxTokens: number;
}): Record<string, unknown> {
  if (!isReasoningModel(params.model)) {
    return { temperature: params.temperature, max_tokens: params.maxTokens };
  }

  return {
    max_completion_tokens: params.maxTokens,
    // El SDK (openai@6) todavía no tipa 'none' en ReasoningEffort aunque la API
    // lo acepta. Se puede quitar el cast cuando se actualice la dependencia.
    reasoning_effort: 'none' as any,
  };
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
