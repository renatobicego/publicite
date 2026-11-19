import { IdentityCheckResult } from '../../domain/identity.verification.types';

export const DNI_ALREADY_VERIFIED_MESSAGE =
  'Ya hay una cuenta registrada con este DNI.';

const UNAVAILABLE_MESSAGE =
  'No pudimos verificar tu DNI en este momento. Probá de nuevo en unos minutos.';

/** Mensaje para el usuario cuando la verificación no aprueba. */
export function identityRejectionMessage(result: IdentityCheckResult): string {
  if (result.status === 'unavailable') return UNAVAILABLE_MESSAGE;

  switch (result.outcomeCode) {
    case 'DOCUMENT_NOT_FOUND':
    case 'INVALID_DOCUMENT_FORMAT':
      return 'No encontramos ese DNI en RENAPER. Revisá el número.';
    case 'MINOR_BLOCKED':
      return 'Tenés que ser mayor de edad para registrarte.';
    case 'DOCUMENT_SUPERSEDED':
      return 'Ese DNI fue reemplazado por un ejemplar más nuevo. Revisá el número.';
    case 'NO_MATCH':
    case 'PARTIAL_MATCH':
      return 'Los datos no coinciden con los de RENAPER. Revisá el DNI, el sexo y la fecha de nacimiento.';
    default:
      return 'No pudimos verificar tu identidad con esos datos. Revisá el DNI, el sexo y la fecha de nacimiento.';
  }
}
