/**
 * Modo simulado de MercadoPago, SÓLO para desarrollo local (`npm run dev`).
 *
 * Con `MP_MOCK=true` en `.env.qa` el server no llama a MercadoPago: responde un
 * adaptador falso (`MockFetchToMercadoPagoAdapter`) y el cliente muestra un
 * formulario de pago simulado (`NEXT_PUBLIC_MP_MOCK=true` en `client/.env.local`).
 * Sirve para ver las pantallas y los flujos sin cobrar nada.
 *
 * Sólo se activa con NODE_ENV=qa (el de `npm run dev`); en producción nunca.
 */
export function isMpMockEnabled(): boolean {
  return process.env.MP_MOCK === 'true' && process.env.NODE_ENV === 'qa';
}

/** Precio que se usa si un plan simulado no tiene `price` cargado. */
export const MP_MOCK_DEFAULT_AMOUNT = 1000;

/**
 * El "token de tarjeta" que manda el formulario simulado decide el resultado:
 * `mock_APRO` aprobado, `mock_OTHE` rechazado.
 */
export const MP_MOCK_REJECTED_TOKEN = 'mock_OTHE';
