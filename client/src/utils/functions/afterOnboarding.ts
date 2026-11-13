/*
Volver al link después de registrarse. Clerk pierde el `redirect_url` porque el
proxy manda a /onboarding a quien no lo terminó; por eso el camino se guarda en
una cookie y el layout de (clerk) redirige ahí al completar el onboarding.
Sólo se aceptan caminos internos de las pantallas que lo necesitan (canjear un
regalo y sumarse a un grupo de Hacete Amigo).
*/

export const AFTER_ONBOARDING_COOKIE = "soon_after_onboarding";

/** Siete días (decisión L del plan): alcanza aunque tarde en registrarse. */
export const AFTER_ONBOARDING_MAX_AGE = 7 * 24 * 60 * 60;

const ALLOWED_PREFIXES = ["/canjear/", "/hacete-amigo/unirse/"];

/** Devuelve el camino si es interno y de una pantalla permitida; si no, null. */
export const safeAfterOnboardingPath = (
  value: string | null | undefined
): string | null => {
  if (!value) return null;
  let path: string;
  try {
    path = decodeURIComponent(value);
  } catch {
    return null;
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return null;
  }
  return ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix))
    ? path
    : null;
};

/** Para el navegador: guarda a dónde volver. */
export const rememberAfterOnboarding = (path: string) => {
  if (typeof document === "undefined" || !safeAfterOnboardingPath(path)) return;
  document.cookie = `${AFTER_ONBOARDING_COOKIE}=${encodeURIComponent(
    path
  )}; path=/; max-age=${AFTER_ONBOARDING_MAX_AGE}; samesite=lax`;
};

/** Para el navegador: ya se volvió, se borra. */
export const forgetAfterOnboarding = () => {
  if (typeof document === "undefined") return;
  if (!document.cookie.includes(`${AFTER_ONBOARDING_COOKIE}=`)) return;
  document.cookie = `${AFTER_ONBOARDING_COOKIE}=; path=/; max-age=0; samesite=lax`;
};
