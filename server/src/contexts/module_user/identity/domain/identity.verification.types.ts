/**
 * Verificación de identidad al registrarse (DNI contra RENAPER vía Didit).
 * Ver `plan-feature-identidad-verificada.md`.
 */

/** Datos que se mandan a RENAPER. `gender` ya viene traducido a M/F/X. */
export interface PersonIdentityInput {
  dni: string;
  gender: 'M' | 'F' | 'X';
  birthDate: string; // YYYY-MM-DD
  reference: string; // clerkId, para encontrar la consulta en Didit
}

/**
 * - `approved`: el DNI existe y coincide con sexo y fecha de nacimiento.
 * - `declined`: RENAPER respondió y los datos no corresponden.
 * - `unavailable`: no se pudo verificar (RENAPER o Didit caídos, error de config).
 *   El registro también se bloquea, con un mensaje de "probá más tarde".
 */
export type IdentityCheckStatus = 'approved' | 'declined' | 'unavailable';

export interface IdentityCheckResult {
  status: IdentityCheckStatus;
  outcomeCode: string;
  requestId?: string;
}

/** Lo que se guarda en `User.identityVerification` al aprobar. */
export interface IdentityVerificationRecord {
  provider: 'didit' | 'mock';
  method: 'renaperData';
  requestId?: string;
  verifiedAt: Date;
}
