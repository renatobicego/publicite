import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';

import { getTokenFromRequest } from '../../utils/functions/getTokenFromRequest';
import { resolveRoleFromToken } from './clerk.role';

/**
 * Exige rol `admin`. Se usa SIEMPRE después de ClerkAuthGuard
 * (`@UseGuards(ClerkAuthGuard, AdminGuard)`): el primero valida la firma del
 * token y setea `userRequestId`, éste sólo decide sobre el rol.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let token: string | undefined;

    try {
      token = getTokenFromRequest(context as any);
    } catch {
      throw new ForbiddenException('Admin access required');
    }

    if (!token) {
      throw new ForbiddenException('Admin access required');
    }

    let role: string | undefined;
    try {
      role = await resolveRoleFromToken(token.toString());
    } catch (error: any) {
      this.logger.error(`No se pudo resolver el rol: ${error.message}`);
      throw new ForbiddenException('Admin access required');
    }

    if (role !== 'admin') {
      this.logger.warn(`Acceso admin denegado (rol: ${role ?? 'sin rol'})`);
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
