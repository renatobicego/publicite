/** Formatos de imagen estándar permitidos (se rechazan HEIC, TIFF, BMP, etc.). */
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

/** Valor listo para el atributo `accept` de un `<input type="file">`. */
export const ALLOWED_IMAGE_ACCEPT = ALLOWED_IMAGE_MIME_TYPES.join(",");

export const INVALID_IMAGE_FORMAT_MESSAGE =
  "Formato de imagen no permitido. Usá JPG, PNG, WEBP o GIF.";

export const isAllowedImageFile = (file: File): boolean =>
  (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type);
