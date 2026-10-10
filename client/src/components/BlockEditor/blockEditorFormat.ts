import { OutputData } from "@editorjs/editorjs";
import { sanitizeBlockData } from "@/utils/functions/sanitizeBlocks";

/**
 * Bloque en el formato que espera/devuelve el backend: `data` es un JSON
 * stringificado (mismo contrato que Novedades y que los artículos de
 * Mis Producciones).
 */
export interface SerializedBlock {
  type: string;
  data: string;
}

// Los tunes de un bloque (p. ej. la alineación) viajan dentro del mismo JSON de
// `data`, bajo esta clave: el backend sólo guarda `{ type, data }`.
const TUNES_KEY = "_tunes";

/**
 * Convierte el `OutputData` de Editor.js al formato del backend
 * (stringifica el `data` de cada bloque).
 */
export const serializeBlocks = (
  editorData: OutputData
): SerializedBlock[] =>
  editorData.blocks.map((block) => {
    // Un tune que no tiene nada que guardar devuelve `undefined`.
    const tunes = Object.entries(block.tunes ?? {}).filter(
      ([, value]) => value !== undefined
    );
    return {
      type: block.type,
      data: JSON.stringify(
        tunes.length > 0
          ? { ...block.data, [TUNES_KEY]: Object.fromEntries(tunes) }
          : block.data
      ),
    };
  });

/**
 * Convierte los bloques del backend (con `data` stringificado) al `OutputData`
 * que consume Editor.js para renderizar/editar. El contenido sale sanitizado:
 * tanto el editor como `BlockRenderer` lo insertan con `innerHTML`.
 */
export const deserializeBlocks = (
  blocks: SerializedBlock[] | undefined | null
): OutputData => ({
  time: new Date().getTime(),
  blocks: (blocks ?? []).map((block, index) => {
    const { [TUNES_KEY]: tunes, ...data } = sanitizeBlockData(
      safeParse(block.data)
    );
    return {
      id: `block_${index}`,
      type: block.type as any,
      data,
      ...(tunes ? { tunes } : {}),
    };
  }),
});

const safeParse = (value: string): any => {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
};
