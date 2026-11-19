/**
 * Verificación del DNI con RENAPER al registrarse una persona. La exige el
 * server (IDENTITY_VERIFICATION_ENABLED); esta variable sólo cambia los textos
 * del onboarding. Prender las dos juntas.
 */
export const isIdentityVerificationEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_IDENTITY_VERIFICATION_ENABLED === "true";
