import { auth } from "@clerk/nextjs/server";

/*
Token para el server (GraphQL), con el template de Clerk.

Pedir un token con template es una llamada a la API de Clerk en cada request
(250-400 ms medidos desde Argentina el 16/11/2026), y casi todas las server
actions piden uno. El del template "testing" dura 7 días, así que se reusa unos
minutos por sesión en memoria del server de Next.

La clave lleva la sesión y los datos de `metadata` de la sesión (mongoId,
onboarding, tipo de usuario): si cambian, por ejemplo al terminar el onboarding,
se pide un token nuevo con los datos al día.
*/
const REUSE_MS = 5 * 60 * 1000;
/** Margen para no mandar un token que vence en el camino. */
const EXPIRY_MARGIN_MS = 60 * 1000;
const MAX_ENTRIES = 1000;

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

/** Vencimiento del JWT en ms (claim `exp`), o null si no se puede leer. */
function expiresAtOf(token: string): number | null {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const exp = JSON.parse(atob(payload)).exp;
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

function remember(key: string, token: string, now: number) {
  const exp = expiresAtOf(token);
  const expiresAt = Math.min(now + REUSE_MS, exp ? exp - EXPIRY_MARGIN_MS : now + REUSE_MS);
  if (expiresAt <= now) return;
  if (tokenCache.size >= MAX_ENTRIES) {
    for (const [cachedKey, entry] of tokenCache) {
      if (entry.expiresAt <= now) tokenCache.delete(cachedKey);
    }
    if (tokenCache.size >= MAX_ENTRIES) tokenCache.clear();
  }
  tokenCache.set(key, { token, expiresAt });
}

export async function getAuthToken(template = "testing"): Promise<string> {
  const authData = await auth();

  if (!authData.userId || !authData.sessionId) {
    return "";
  }

  const key = [
    authData.sessionId,
    template,
    JSON.stringify(authData.sessionClaims?.metadata ?? null),
  ].join("|");
  const now = Date.now();
  const cached = tokenCache.get(key);
  if (cached && cached.expiresAt > now) return cached.token;

  const token = await authData.getToken({ template });

  if (!token) {
    return "";
  }
  remember(key, token, now);
  return token;
}
