/**
 * Peso real de un archivo ya subido a UploadThing, leído del CDN con un HEAD.
 *
 * El cliente informa el tamaño al registrar el archivo, pero no se puede
 * confiar en ese número: con archivos de hasta 8 GB, alguien podría subir un
 * video enorme y declarar 1 KB para no gastar su cupo. Si `UPLOADTHING_FILE_URL`
 * (la misma base que `NEXT_PUBLIC_UPLOADTHING_URL` del cliente, terminada en
 * `/f/`) no está configurada o el CDN no responde, devuelve null y se usa el
 * tamaño que mandó el cliente.
 */
const HEAD_TIMEOUT_MS = 5000;
const VIDEO_KEY_SUFFIX = 'video';

export async function fetchUploadedFileSize(
  key: string,
): Promise<number | null> {
  const base = process.env.UPLOADTHING_FILE_URL;
  if (!base || !key) return null;
  // Convención de Anuncios: al key de un video se le agrega "video" al final.
  const realKey = key.endsWith(VIDEO_KEY_SUFFIX)
    ? key.slice(0, -VIDEO_KEY_SUFFIX.length)
    : key;
  try {
    const response = await fetch(`${base}${encodeURIComponent(realKey)}`, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const length = Number(response.headers.get('content-length'));
    return Number.isFinite(length) && length > 0 ? length : null;
  } catch {
    return null;
  }
}
