import { OutputData } from "@editorjs/editorjs";

/**
 * Bloque en el formato que espera/devuelve el backend: `data` es un JSON
 * stringificado (mismo contrato que Novedades y que los artículos de
 * Mis Producciones).
 */
export interface SerializedBlock {
  type: string;
  data: string;
}

/**
 * Convierte el `OutputData` de Editor.js al formato del backend
 * (stringifica el `data` de cada bloque).
 */
export const serializeBlocks = (
  editorData: OutputData
): SerializedBlock[] =>
  editorData.blocks.map((block) => ({
    type: block.type,
    data: JSON.stringify(block.data),
  }));

/**
 * Convierte los bloques del backend (con `data` stringificado) al `OutputData`
 * que consume Editor.js para renderizar/editar.
 */
export const deserializeBlocks = (
  blocks: SerializedBlock[] | undefined | null
): OutputData => ({
  time: new Date().getTime(),
  blocks: (blocks ?? []).map((block, index) => ({
    id: `block_${index}`,
    type: block.type as any,
    data: safeParse(block.data),
  })),
});

const safeParse = (value: string): any => {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};
