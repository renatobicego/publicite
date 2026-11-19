import { Injectable } from '@nestjs/common';

import { IdentityVerifierInterface } from '../../domain/identity.verifier.interface';
import {
  IdentityCheckResult,
  PersonIdentityInput,
} from '../../domain/identity.verification.types';

/**
 * Verificador simulado para QA (`IDENTITY_MOCK=true` + `NODE_ENV=qa`). No llama
 * a Didit. El final del DNI decide el resultado:
 * - termina en `00` → datos que no coinciden (`NO_MATCH`);
 * - termina en `01` → DNI inexistente (`DOCUMENT_NOT_FOUND`);
 * - termina en `99` → RENAPER caído (`REGISTRY_UNAVAILABLE`);
 * - cualquier otro → aprobado.
 */
@Injectable()
export class MockIdentityVerifier implements IdentityVerifierInterface {
  readonly provider = 'mock' as const;

  async verifyPerson(input: PersonIdentityInput): Promise<IdentityCheckResult> {
    const requestId = `mock-${Date.now()}`;
    if (input.dni.endsWith('00')) {
      return { status: 'declined', outcomeCode: 'NO_MATCH', requestId };
    }
    if (input.dni.endsWith('01')) {
      return { status: 'declined', outcomeCode: 'DOCUMENT_NOT_FOUND', requestId };
    }
    if (input.dni.endsWith('99')) {
      return { status: 'unavailable', outcomeCode: 'REGISTRY_UNAVAILABLE', requestId };
    }
    return { status: 'approved', outcomeCode: 'MATCH', requestId };
  }
}
