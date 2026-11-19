/**
 * Configuración de la verificación de identidad (env vars del server).
 *
 * - `IDENTITY_VERIFICATION_ENABLED=true`: exige verificar el DNI con RENAPER para
 *   crear una cuenta de persona. Default apagado.
 * - `DIDIT_API_KEY`: clave de Didit. Con la verificación prendida y sin clave,
 *   el registro de personas queda bloqueado (se loguea el error).
 * - `DIDIT_API_URL`: default `https://verification.didit.me`.
 * - `IDENTITY_MOCK=true` (sólo con `NODE_ENV=qa`): no llama a Didit; ver
 *   `MockIdentityVerifier`.
 */
export function isIdentityVerificationEnabled(): boolean {
  return process.env.IDENTITY_VERIFICATION_ENABLED === 'true';
}

export function isIdentityMock(): boolean {
  return process.env.IDENTITY_MOCK === 'true' && process.env.NODE_ENV === 'qa';
}

export function getDiditApiKey(): string | undefined {
  return process.env.DIDIT_API_KEY || undefined;
}

export function getDiditApiUrl(): string {
  return (process.env.DIDIT_API_URL || 'https://verification.didit.me').replace(/\/+$/, '');
}

export const DIDIT_TIMEOUT_MS = 15000;
