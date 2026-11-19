import { Injectable } from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { IdentityVerifierInterface } from '../../domain/identity.verifier.interface';
import {
  IdentityCheckResult,
  PersonIdentityInput,
} from '../../domain/identity.verification.types';
import {
  DIDIT_TIMEOUT_MS,
  getDiditApiKey,
  getDiditApiUrl,
} from '../../application/identity.config';
import { evaluateDiditResponse } from '../../application/functions/evaluateDiditResponse';

/**
 * Didit, servicio `arg_renaper_data`: DNI + sexo + fecha de nacimiento contra
 * RENAPER, sin selfie. USD 0,20 por consulta exitosa (no cobra las que fallan
 * por RENAPER caído o datos inválidos).
 * Doc: https://docs.didit.me/api-reference/database-validation/argentina/renaper-data
 */
@Injectable()
export class DiditIdentityVerifier implements IdentityVerifierInterface {
  readonly provider = 'didit' as const;

  constructor(private readonly logger: MyLoggerService) {}

  async verifyPerson(input: PersonIdentityInput): Promise<IdentityCheckResult> {
    const apiKey = getDiditApiKey();
    if (!apiKey) {
      this.logger.error(
        'Verificación de identidad prendida sin DIDIT_API_KEY: el registro de personas está bloqueado',
      );
      return { status: 'unavailable', outcomeCode: 'NOT_CONFIGURED' };
    }

    let response: Response;
    try {
      response = await fetch(`${getDiditApiUrl()}/v3/database-validation/`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          issuing_state: 'ARG',
          services: ['arg_renaper_data'],
          document_number: input.dni,
          gender: input.gender,
          date_of_birth: input.birthDate,
          vendor_data: input.reference,
        }),
        signal: AbortSignal.timeout(DIDIT_TIMEOUT_MS),
      });
    } catch (error: any) {
      this.logger.error('Didit no respondió: ' + (error?.message ?? error));
      return { status: 'unavailable', outcomeCode: 'NETWORK_ERROR' };
    }

    const body = await response.json().catch(() => null);

    if (response.status === 400) {
      // Datos que Didit rechaza antes de consultar (formato del DNI, etc.).
      this.logger.warn('Didit rechazó los datos: ' + JSON.stringify(body));
      return { status: 'declined', outcomeCode: 'INVALID_INPUT' };
    }

    if (!response.ok) {
      // 401/403 = clave inválida o sin crédito; 5xx = proveedor caído.
      this.logger.error(
        `Didit respondió ${response.status}: ${JSON.stringify(body)}`,
      );
      return { status: 'unavailable', outcomeCode: `HTTP_${response.status}` };
    }

    const result = evaluateDiditResponse(body);
    this.logger.log(
      `Verificación RENAPER ${result.status} (${result.outcomeCode}) request ${result.requestId ?? '-'}`,
    );
    return result;
  }
}
