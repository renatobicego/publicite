import { PRODUCTIONS } from "@/utils/data/urls";
import { FOLDER_PARAM } from "./productionBrowse";

/**
 * Links para compartir el contenido de un blog. Apuntan directo al resultado:
 * un archivo o artículo abre su detalle (con el camino de carpetas en el
 * breadcrumb) y una carpeta abre el blog en ese nivel. Nunca llevan la vista
 * previa de visitante.
 */
export const productionItemPath = (productionId: string, itemId: string) =>
  `${PRODUCTIONS}/${productionId}/item/${itemId}`;

export const productionFolderPath = (
  productionId: string,
  folderId?: string | null
) =>
  folderId
    ? `${PRODUCTIONS}/${productionId}?${FOLDER_PARAM}=${folderId}`
    : `${PRODUCTIONS}/${productionId}`;

/** URL absoluta (sólo en el cliente). */
export const absoluteUrl = (path: string) =>
  `${window.location.origin}${path}`;
