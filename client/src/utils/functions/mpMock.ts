/**
 * MercadoPago simulado para desarrollo local (NEXT_PUBLIC_MP_MOCK=true en
 * `client/.env.local`, junto con MP_MOCK=true en `server/.env.qa`). El
 * formulario de pago es falso y los planes salen de la base, no de MercadoPago.
 * Nunca activarlo en producción.
 */
export const isMpMock = (): boolean => process.env.NEXT_PUBLIC_MP_MOCK === "true";

/** Precio que usa el server simulado si un plan no tiene `price` (mismo valor que el server). */
export const MP_MOCK_DEFAULT_AMOUNT = 1000;
