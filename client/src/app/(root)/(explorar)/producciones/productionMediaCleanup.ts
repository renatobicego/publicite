import {
  ProductionItemKind,
  ProductionItemResponse,
} from "@/types/productionTypes";
import { deleteFilesService } from "@/app/server/uploadThing";

/**
 * Devuelve las `key` de UploadThing asociadas a un ítem, listas para borrar.
 *
 * - Archivo: su `key` (a los videos se les quita el sufijo "video", misma
 *   convención que Anuncios).
 * - Artículo: las imágenes embebidas en los bloques de Editor.js
 *   (`data.file.key`).
 * - Carpeta: se ignora (el borrado en cascada de sus archivos/artículos debe
 *   limpiarse en el backend; el cliente no conoce todo el subárbol).
 */
export const collectItemFileKeys = (item: ProductionItemResponse): string[] => {
  if (item.kind === ProductionItemKind.file && item.key) {
    const isVideo = item.key.includes("video");
    return [isVideo ? item.key.replace("video", "") : item.key];
  }

  if (item.kind === ProductionItemKind.article && item.blocks?.length) {
    const keys: string[] = [];
    for (const block of item.blocks) {
      if (block.type !== "image") continue;
      try {
        const data = JSON.parse(block.data) as {
          file?: { key?: string };
        };
        const key = data?.file?.key;
        if (key) keys.push(key);
      } catch {
        // Bloque con `data` inválido: se ignora.
      }
    }
    return keys;
  }

  return [];
};

/**
 * Borra de UploadThing los archivos asociados a un ítem (archivo o artículo).
 * Se llama DESPUÉS de un borrado exitoso en la base. No corta el flujo si la
 * limpieza falla: el borrado del ítem ya se hizo y los archivos quedarían
 * huérfanos, pero eso no debe romper la UX.
 */
export const cleanupItemFiles = async (
  item: ProductionItemResponse
): Promise<void> => {
  const keys = collectItemFileKeys(item);
  if (keys.length === 0) return;
  try {
    await deleteFilesService(keys);
  } catch {
    // Silencioso: la limpieza de archivos no es crítica para la UX.
  }
};
