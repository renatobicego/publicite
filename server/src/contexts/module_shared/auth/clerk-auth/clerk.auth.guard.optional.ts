import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { verifyToken } from '@clerk/express';
import { GqlExecutionContext } from '@nestjs/graphql';

import {
  getIdFromClerkToken,
  getTokenFromRequest,
} from '../../utils/functions/getTokenFromRequest';

@Injectable()
export class ClerkAuthGuardOptional implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuardOptional.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let token: string | undefined;
    let request: any;

    try {
      token = getTokenFromRequest(context as any);
    } catch {
      // Sin token: permitimos el acceso sin userRequestId
      return true;
    }

    if (!token) return true;

    try {
      await verifyToken(token.toString(), {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      if (context.getType() === 'http') {
        request = context.switchToHttp().getRequest();
      } else if (context.getType() === ('graphql' as any)) {
        const gqlContext = GqlExecutionContext.create(context);
        request = gqlContext.getContext().req;
      } else {
        return true;
      }

      request.userRequestId = getIdFromClerkToken(token);
      request.isUserRegister = true;
    } catch (error) {
      this.logger.warn(`Token inválido en guard opcional: ${error.message}`);
      // Token inválido: dejamos pasar sin userRequestId
    }

    return true;
  }
}
