import { ProductionFileType } from "@/types/productionTypes";
import {
  ALLOWED_IMAGE_ACCEPT,
  isAllowedImageFile,
} from "@/utils/functions/imageFormats";

/** Familia de un documento de Office/OpenDocument (define ícono y color). */
export type ProductionDocumentFamily = "word" | "excel" | "powerpoint";

const DOCUMENT_EXTENSIONS: Record<string, ProductionDocumentFamily> = {
  doc: "word",
  docx: "word",
  odt: "word",
  xls: "excel",
  xlsx: "excel",
  ods: "excel",
  ppt: "powerpoint",
  pptx: "powerpoint",
  odp: "powerpoint",
};

const extensionOf = (name: string | null | undefined): string =>
  (name ?? "").split(".").pop()?.toLowerCase() ?? "";

/** Valor del `accept` del input de archivos de un blog. */
export const PRODUCTION_FILE_ACCEPT = [
  ALLOWED_IMAGE_ACCEPT,
  "video/*",
  "audio/*",
  "application/pdf",
  ...Object.keys(DOCUMENT_EXTENSIONS).map((extension) => `.${extension}`),
].join(",");

/**
 * Mapea el archivo del navegador al `ProductionFileType` del backend.
 * Los documentos se reconocen por extensión: según el sistema operativo, el
 * navegador puede no informar el MIME de un archivo de Office.
 */
export const detectProductionFileType = (
  file: File
): ProductionFileType | undefined => {
  if (file.type.startsWith("image/")) {
    return isAllowedImageFile(file) ? ProductionFileType.photo : undefined;
  }
  if (file.type.startsWith("video/")) return ProductionFileType.video;
  if (file.type.startsWith("audio/")) return ProductionFileType.audio;
  const extension = extensionOf(file.name);
  if (file.type === "application/pdf" || extension === "pdf") {
    return ProductionFileType.writing;
  }
  if (DOCUMENT_EXTENSIONS[extension]) return ProductionFileType.document;
  return undefined;
};

/**
 * Familia de un documento ya subido, a partir de su nombre (que por defecto es
 * el nombre original del archivo). Si el usuario lo renombró sin extensión no
 * se puede saber y se muestra el ícono genérico.
 */
export const documentFamilyOf = (
  ...names: (string | null | undefined)[]
): ProductionDocumentFamily | undefined => {
  for (const name of names) {
    const family = DOCUMENT_EXTENSIONS[extensionOf(name)];
    if (family) return family;
  }
  return undefined;
};
