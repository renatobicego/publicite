import { FilterXSS } from 'xss';

/**
 * Sanitización de los bloques de un artículo (Editor.js) antes de guardarlos.
 *
 * El HTML de los bloques lo arma el navegador del autor y el cliente lo muestra
 * con `innerHTML`: sin este filtro, cualquiera con permiso de edición podría
 * guardar un script llamando a la API directo. Se deja pasar sólo el formato de
 * texto que ofrece el editor. El cliente aplica el mismo filtro al mostrar
 * (`client/src/utils/functions/sanitizeBlocks.ts`): mantener ambos alineados.
 */

// Valores de estilo simples (colores, tamaños, palabras clave). Sin `url(...)`.
const SAFE_STYLE_VALUE = /^[#a-z0-9(),.%\s-]+$/i;

const htmlFilter = new FilterXSS({
  whiteList: {
    a: ['href', 'target', 'rel'],
    b: [],
    strong: [],
    i: [],
    em: [],
    u: [],
    s: [],
    strike: [],
    mark: [],
    code: [],
    sub: [],
    sup: [],
    br: [],
    span: ['style'],
    font: ['color', 'size', 'style'],
  },
  css: {
    whiteList: {
      color: SAFE_STYLE_VALUE,
      'background-color': SAFE_STYLE_VALUE,
      'font-size': SAFE_STYLE_VALUE,
      'font-weight': SAFE_STYLE_VALUE,
      'font-style': SAFE_STYLE_VALUE,
      'text-decoration': SAFE_STYLE_VALUE,
      'text-decoration-line': SAFE_STYLE_VALUE,
      'text-align': SAFE_STYLE_VALUE,
    },
  },
  // Las etiquetas no permitidas se quitan (queda su texto); de script y style
  // se descarta también el contenido.
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
});

/** HTML de texto con formato: sólo las etiquetas y estilos del editor. */
export function sanitizeInlineHtml(html: string): string {
  return htmlFilter.process(html);
}

/** Sólo URLs http(s): descarta `javascript:`, `data:` y similares. */
export function sanitizeUrl(url: string): string {
  return /^https?:\/\//i.test(url.trim()) ? url.trim() : '';
}

// Campos que son direcciones y no HTML.
const URL_FIELDS = new Set(['url', 'link', 'href', 'src']);
// Keys de UploadThing: identificadores, no se tocan.
const RAW_FIELDS = new Set(['key']);

function sanitizeValue(value: unknown, field?: string): unknown {
  if (typeof value === 'string') {
    if (field && RAW_FIELDS.has(field)) return value;
    if (field && URL_FIELDS.has(field)) return sanitizeUrl(value);
    return sanitizeInlineHtml(value);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry, field));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        sanitizeValue(entry, key),
      ]),
    );
  }
  return value;
}

/**
 * Sanitiza el `data` (JSON stringificado) de cada bloque: todo texto pasa por
 * el filtro de HTML y toda dirección tiene que ser http(s). Se recorre el JSON
 * completo, sin depender del tipo de bloque, para que un tipo nuevo quede
 * cubierto sin tocar esto. Un `data` que no es un objeto JSON se guarda vacío.
 */
export function sanitizeArticleBlocks(
  blocks: { type: string; data: string }[] | undefined | null,
): { type: string; data: string }[] {
  return (blocks ?? []).map(({ type, data }) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      parsed = null;
    }
    const isObject =
      !!parsed && typeof parsed === 'object' && !Array.isArray(parsed);
    return {
      type,
      data: JSON.stringify(isObject ? sanitizeValue(parsed) : {}),
    };
  });
}
