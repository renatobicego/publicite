import { FilterXSS } from "xss";

/**
 * Sanitización del contenido de bloques de Editor.js antes de mostrarlo o de
 * cargarlo en el editor (ambos lo insertan con `innerHTML`).
 *
 * El server ya sanitiza al guardar; esto es la segunda barrera y cubre los
 * artículos guardados antes de que existiera ese filtro. Mismas reglas que
 * `server/.../application/functions/production.article-sanitize.ts`: mantener
 * ambos alineados.
 */

// Valores de estilo simples (colores, tamaños, palabras clave). Sin `url(...)`.
const SAFE_STYLE_VALUE = /^[#a-z0-9(),.%\s-]+$/i;

const htmlFilter = new FilterXSS({
  whiteList: {
    a: ["href", "target", "rel"],
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
    span: ["style"],
    font: ["color", "size", "style"],
  },
  css: {
    whiteList: {
      color: SAFE_STYLE_VALUE,
      "background-color": SAFE_STYLE_VALUE,
      "font-size": SAFE_STYLE_VALUE,
      "font-weight": SAFE_STYLE_VALUE,
      "font-style": SAFE_STYLE_VALUE,
      "text-decoration": SAFE_STYLE_VALUE,
      "text-decoration-line": SAFE_STYLE_VALUE,
      "text-align": SAFE_STYLE_VALUE,
    },
  },
  // Las etiquetas no permitidas se quitan (queda su texto); de script y style
  // se descarta también el contenido.
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style"],
});

/** HTML de texto con formato: sólo las etiquetas y estilos del editor. */
export const sanitizeInlineHtml = (html: unknown): string =>
  typeof html === "string" ? htmlFilter.process(html) : "";

/** Sólo URLs http(s): descarta `javascript:`, `data:` y similares. */
export const sanitizeUrl = (url: unknown): string =>
  typeof url === "string" && /^https?:\/\//i.test(url.trim()) ? url.trim() : "";

// Campos que son direcciones y no HTML.
const URL_FIELDS = new Set(["url", "link", "href", "src"]);
// Keys de UploadThing: identificadores, no se tocan.
const RAW_FIELDS = new Set(["key"]);

/**
 * Sanitiza el `data` ya parseado de un bloque: todo texto pasa por el filtro de
 * HTML y toda dirección tiene que ser http(s). Recorre el JSON completo, sin
 * depender del tipo de bloque.
 */
export const sanitizeBlockData = <T>(value: T, field?: string): T => {
  if (typeof value === "string") {
    if (field && RAW_FIELDS.has(field)) return value;
    if (field && URL_FIELDS.has(field)) return sanitizeUrl(value) as T;
    return sanitizeInlineHtml(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeBlockData(entry, field)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        sanitizeBlockData(entry, key),
      ])
    ) as T;
  }
  return value;
};
