import { IdentityCheckResult } from '../../domain/identity.verification.types';

const UNAVAILABLE_CODES = new Set([
  'INCONCLUSIVE',
  'REGISTRY_UNAVAILABLE',
  'REGISTRY_ERROR',
]);

/**
 * Traduce la respuesta 200 de `POST /v3/database-validation/` (servicio
 * `arg_renaper_data`) a aprobado / rechazado / no disponible.
 *
 * Aprueba con `MATCH`, o con `PARTIAL_MATCH` si lo que no coincide no es ni el
 * DNI ni la fecha de nacimiento ni el sexo (no mandamos nombre, así que no
 * debería pasar, pero la documentación no lo aclara). Acepta la respuesta con
 * los datos arriba o dentro de `database_validation` (la doc muestra las dos).
 */
export function evaluateDiditResponse(body: any): IdentityCheckResult {
  const root = body?.database_validation ?? body ?? {};
  const requestId: string | undefined = body?.request_id ?? root?.request_id;
  const validations: any[] = Array.isArray(root?.validations)
    ? root.validations
    : [];
  const validation =
    validations.find((v) => v?.service_id === 'arg_renaper_data') ??
    validations[0];

  if (!validation) {
    return { status: 'unavailable', outcomeCode: 'NO_RESULT', requestId };
  }

  const code = String(validation.outcome_code ?? '').toUpperCase() || 'UNKNOWN';

  if (code === 'MATCH') {
    return { status: 'approved', outcomeCode: code, requestId };
  }

  if (code === 'PARTIAL_MATCH') {
    const fields = validation.validation ?? {};
    const genderOk = validation.source_data?.gender_match !== false;
    if (
      fields.identification_number === 'full_match' &&
      fields.date_of_birth === 'full_match' &&
      genderOk
    ) {
      return { status: 'approved', outcomeCode: code, requestId };
    }
    return { status: 'declined', outcomeCode: code, requestId };
  }

  if (UNAVAILABLE_CODES.has(code)) {
    return { status: 'unavailable', outcomeCode: code, requestId };
  }

  return { status: 'declined', outcomeCode: code, requestId };
}

/** `Gender` de la app (M/F/O/X) → sexo que acepta RENAPER (M/F/X). */
export function toRenaperGender(gender: string | undefined): 'M' | 'F' | 'X' {
  const g = String(gender ?? '').toUpperCase();
  if (g === 'M' || g === 'F') return g;
  return 'X';
}
