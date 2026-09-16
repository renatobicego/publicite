import { UnauthorizedException } from '@nestjs/common';

import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';

export type ProductionGqlContext = { req: CustomContextRequestInterface };

/**
 * mongoId de quien hace la request. `ClerkAuthGuard` deja pasar el token de
 * "usuario no registrado" sin `userRequestId`, así que las operaciones que
 * modifican datos lo exigen explícitamente.
 */
export function requireUserId(context: ProductionGqlContext): string {
  const userId = context?.req?.userRequestId;
  if (!userId) {
    throw new UnauthorizedException('Tenés que iniciar sesión');
  }
  return userId;
}

/** mongoId si la request viene autenticada (guard opcional). */
export function optionalUserId(context: ProductionGqlContext): string | undefined {
  return context?.req?.userRequestId || undefined;
}
