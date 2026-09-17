import { FILE_URL } from "@/utils/data/urls";

/**
 * Resuelve la URL de un archivo de UploadThing a partir de su `key`.
 * Para videos, el `key` guardado tiene el sufijo literal "video" que hay que
 * quitar antes de armar la URL (misma convención que Anuncios).
 */
export const resolveProductionFileUrl = (
  key: string | null | undefined,
  isVideoFile = false
): string => {
  if (!key) return "";
  const cleanKey = isVideoFile ? key.replace("video", "") : key;
  return `${FILE_URL}${cleanKey}`;
};
