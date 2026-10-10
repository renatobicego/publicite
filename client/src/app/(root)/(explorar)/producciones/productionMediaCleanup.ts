import {
  ProductionItemKind,
  ProductionItemResponse,
} from "@/types/productionTypes";
import { deleteFilesService } from "@/app/server/uploadThing";
import { getProductionItemById } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";

/**
 * Devuelve las `key` de UploadThing asociadas a un ítem, listas para borrar.
 *
 * - Archivo: su `key` (a los videos se les quita el sufijo "video", misma
 *   convención que Anuncios).
 * - Artículo: los archivos embebidos en los bloques de Editor.js (imagen,
 *   audio, video y grilla de fotos). Necesita los `blocks`, que la grilla no
 *   trae: ver `cleanupItemFiles`.
 * - Carpeta: se ignora (el borrado en cascada de sus archivos/artículos debe
 *   limpiarse en el backend; el cliente no conoce todo el subárbol).
 */
export const collectItemFileKeys = (item: ProductionItemResponse): string[] => {
  // A los videos se les quita el sufijo "video" (convención de Anuncios).
  const realKey = (key: string) =>
    key.endsWith("video") ? key.slice(0, -"video".length) : key;

  if (item.kind === ProductionItemKind.file && item.key) {
    return [realKey(item.key)];
  }

  if (item.kind === ProductionItemKind.article && item.blocks?.length) {
    const keys: string[] = [];
    for (const block of item.blocks) {
      try {
        const data = JSON.parse(block.data) as {
          file?: { key?: string };
          images?: { key?: string }[];
        };
        if (data?.file?.key) keys.push(realKey(data.file.key));
        for (const image of data?.images ?? []) {
          if (image?.key) keys.push(image.key);
        }
      } catch {
        // Bloque con `data` inválido: se ignora.
      }
    }
    return keys;
  }

  return [];
};

/**
 * Trae el ítem completo si hace falta para limpiar sus archivos. La grilla no
 * incluye el contenido de los artículos, así que hay que pedirlo ANTES de
 * borrar (después ya no existe). Si no se puede traer, se devuelve el ítem tal
 * cual: el borrado sigue y, a lo sumo, quedan archivos huérfanos.
 */
export const loadItemForCleanup = async (
  item: ProductionItemResponse
): Promise<ProductionItemResponse> => {
  if (item.kind !== ProductionItemKind.article || item.blocks) return item;
  const full = await getProductionItemById(item._id);
  return isProductionActionError(full) ? item : full;
};

/**
 * Borra de UploadThing los archivos asociados a un ítem (archivo o artículo).
 * Se llama DESPUÉS de un borrado exitoso en la base, con el ítem que devolvió
 * `loadItemForCleanup` antes de borrar. No corta el flujo si la
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
