import type { OutputData } from "@editorjs/editorjs";

export interface WordCount {
  words: number;
  characters: number;
}

/** Texto plano de un valor de bloque: saca etiquetas y entidades HTML. */
const plainText = (html: string): string =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&[a-z#0-9]+;/gi, "x");

// Los bloques guardan el texto en lugares distintos (párrafo: `text`; lista:
// `items`, que pueden anidar; cita: `text` + `caption`; tabla: `content`).
// Se recorren todos los strings menos los que no son texto del artículo.
const NON_TEXT_KEYS = new Set(["url", "file", "style", "_tunes", "alignment"]);

const collectText = (value: unknown, out: string[]): void => {
  if (typeof value === "string") {
    out.push(plainText(value));
  } else if (Array.isArray(value)) {
    value.forEach((entry) => collectText(entry, out));
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, entry]) => {
      if (!NON_TEXT_KEYS.has(key)) collectText(entry, out);
    });
  }
};

/** Recuento de palabras y caracteres del contenido de un `BlockEditor`. */
export const countWords = (content: OutputData | undefined): WordCount => {
  if (!content) return { words: 0, characters: 0 };
  const parts: string[] = [];
  content.blocks.forEach((block) => collectText(block.data, parts));
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  return {
    words: text ? text.split(" ").length : 0,
    characters: text.length,
  };
};

export const formatWordCount = ({ words, characters }: WordCount): string =>
  `${words.toLocaleString("es-AR")} ${words === 1 ? "palabra" : "palabras"} · ${characters.toLocaleString("es-AR")} ${characters === 1 ? "carácter" : "caracteres"}`;
