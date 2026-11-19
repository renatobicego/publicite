import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserRepositoryInterface } from 'src/contexts/module_user/user/domain/repository/user-repository.interface';
import {
  IDENTITY_VERIFIER,
  IdentityVerifierInterface,
} from '../../domain/identity.verifier.interface';
import { IdentityVerificationRecord } from '../../domain/identity.verification.types';
import { isIdentityVerificationEnabled } from '../identity.config';
import { toRenaperGender } from '../functions/evaluateDiditResponse';
import {
  DNI_ALREADY_VERIFIED_MESSAGE,
  identityRejectionMessage,
} from '../functions/identityMessages';

export interface IdentityVerificationServiceInterface {
  verifyPersonForRegistration(input: {
    dni: string;
    gender: string;
    birthDate: string;
    clerkId: string;
  }): Promise<IdentityVerificationRecord | null>;
}

/**
 * Verifica el DNI con RENAPER antes de crear una cuenta de persona. Si no
 * aprueba, lanza y la cuenta no se crea (no hay cuentas "sin verificar").
 * Con `IDENTITY_VERIFICATION_ENABLED` apagado devuelve `null` y el alta sigue
 * como antes.
 */
@Injectable()
export class IdentityVerificationService
  implements IdentityVerificationServiceInterface
{
  constructor(
    @Inject(IDENTITY_VERIFIER)
    private readonly verifier: IdentityVerifierInterface,
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    private readonly logger: MyLoggerService,
  ) {}

  async verifyPersonForRegistration(input: {
    dni: string;
    gender: string;
    birthDate: string;
    clerkId: string;
  }): Promise<IdentityVerificationRecord | null> {
    if (!isIdentityVerificationEnabled()) return null;

    const dni = String(input.dni ?? '').trim();
    const birthDate = String(input.birthDate ?? '').slice(0, 10);
    if (!/^\d{7,8}$/.test(dni) || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      throw new BadRequestException(
        'Revisá el DNI (sin puntos) y la fecha de nacimiento.',
      );
    }

    // Antes de consultar (cada consulta cuesta): un DNI verificado es una sola cuenta.
    if (await this.userRepository.existsVerifiedPersonWithDni(dni)) {
      throw new BadRequestException(DNI_ALREADY_VERIFIED_MESSAGE);
    }

    const result = await this.verifier.verifyPerson({
      dni,
      gender: toRenaperGender(input.gender),
      birthDate,
      reference: input.clerkId,
    });

    if (result.status === 'approved') {
      return {
        provider: this.verifier.provider,
        method: 'renaperData',
        requestId: result.requestId,
        verifiedAt: new Date(),
      };
    }

    this.logger.warn(
      `Registro bloqueado por verificación de identidad: ${result.status} (${result.outcomeCode})`,
    );
    const message = identityRejectionMessage(result);
    if (result.status === 'unavailable') {
      throw new ServiceUnavailableException(message);
    }
    throw new BadRequestException(message);
  }
}
