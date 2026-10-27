/**
 * Achica una imagen (data URL) a JPEG para mandarla como payload de un server
 * action. Un PNG de 1024x1024 en base64 pesa varios MB y puede pasar los
 * límites del body (server action, proxy o hosting); en JPEG queda en cientos de KB.
 * Si algo falla, devuelve la imagen original.
 */
export const compressDataUrl = async (
  dataUrl: string,
  maxSide = 1024,
  quality = 0.85,
): Promise<string> => {
  try {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();

    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;

    // JPEG no tiene transparencia: fondo blanco en vez de negro.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const compressed = canvas.toDataURL("image/jpeg", quality);
    return compressed.length < dataUrl.length ? compressed : dataUrl;
  } catch {
    return dataUrl;
  }
};
