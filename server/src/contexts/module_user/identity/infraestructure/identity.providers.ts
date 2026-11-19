import { Provider } from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import {
  IDENTITY_VERIFICATION_SERVICE,
  IDENTITY_VERIFIER,
} from '../domain/identity.verifier.interface';
import { isIdentityMock } from '../application/identity.config';
import { IdentityVerificationService } from '../application/service/identity.verification.service';
import { DiditIdentityVerifier } from './adapters/didit.identity.verifier';
import { MockIdentityVerifier } from './adapters/mock.identity.verifier';

/** Se registran en `UserModule`, que es donde se crean las cuentas. */
export const IDENTITY_PROVIDERS: Provider[] = [
  {
    provide: IDENTITY_VERIFIER,
    useFactory: (logger: MyLoggerService) =>
      isIdentityMock()
        ? new MockIdentityVerifier()
        : new DiditIdentityVerifier(logger),
    inject: [MyLoggerService],
  },
  {
    provide: IDENTITY_VERIFICATION_SERVICE,
    useClass: IdentityVerificationService,
  },
];
