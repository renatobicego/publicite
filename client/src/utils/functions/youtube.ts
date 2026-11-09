/**
 * Links de YouTube: se guarda el link que pegó el autor y se embebe siempre a
 * partir del id del video (11 caracteres), nunca del link crudo, así que no hay
 * forma de meter otra dirección en el iframe.
 */

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
]);

/** Id del video de un link de YouTube, o null si no es uno válido. */
export const parseYouTubeId = (input: string | null | undefined) => {
  const raw = input?.trim();
  if (!raw) return null;
  if (VIDEO_ID.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) return null;

  let id: string | null = null;
  if (url.hostname.toLowerCase() === "youtu.be") {
    id = url.pathname.split("/")[1] ?? null;
  } else if (url.pathname === "/watch") {
    id = url.searchParams.get("v");
  } else {
    // /embed/ID, /shorts/ID, /live/ID, /v/ID
    const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
    id = match?.[1] ?? null;
  }
  return id && VIDEO_ID.test(id) ? id : null;
};

/** Segundo de inicio de un link (`?t=90`, `?t=1m30s` o `?start=90`). */
export const parseYouTubeStart = (input: string | null | undefined) => {
  const raw = input?.trim();
  if (!raw) return 0;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const value = url.searchParams.get("t") ?? url.searchParams.get("start");
    if (!value) return 0;
    if (/^\d+$/.test(value)) return Number(value);
    const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
    if (!match) return 0;
    const [, h, m, s] = match;
    return Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0);
  } catch {
    return 0;
  }
};

/** URL del reproductor embebido (dominio sin cookies de YouTube). */
export const youTubeEmbedUrl = (videoId: string, start = 0) => {
  const params = new URLSearchParams({ rel: "0" });
  if (start > 0) params.set("start", String(Math.floor(start)));
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
};

/** Miniatura del video. */
export const youTubeThumbnailUrl = (videoId: string) =>
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
