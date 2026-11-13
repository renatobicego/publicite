import { ForbiddenException } from '@nestjs/common';

import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';

/*
El usuario sale siempre del token. ClerkAuthGuard deja pasar el token de "usuario
no registrado" sin userRequestId: acá eso se rechaza.
*/
export function requireUserId(context: { req: CustomContextRequestInterface }): string {
  const userId = context?.req?.userRequestId;
  if (!userId) throw new ForbiddenException('Unauthorized');
  return userId;
}

export function optionalUserId(context: { req: CustomContextRequestInterface }): string | null {
  return context?.req?.userRequestId ?? null;
}
