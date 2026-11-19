import {
  IdentityCheckResult,
  PersonIdentityInput,
} from './identity.verification.types';

/** Puerto hacia el proveedor (Didit o el simulado de QA). Nunca lanza: devuelve `unavailable`. */
export interface IdentityVerifierInterface {
  readonly provider: 'didit' | 'mock';
  verifyPerson(input: PersonIdentityInput): Promise<IdentityCheckResult>;
}

export const IDENTITY_VERIFIER = 'IdentityVerifierInterface';
export const IDENTITY_VERIFICATION_SERVICE = 'IdentityVerificationServiceInterface';
