import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { verifyToken } from '@clerk/express';

import { getTokenFromRequest } from '../../functions/getTokenFromRequest';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let token;

    try {
      token = getTokenFromRequest(context);
      if (!token) {
        this.logger.error('Token not found');
        throw new ForbiddenException('Unauthorized');
      }
      await verifyToken(token.toString(), {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      return true;
    } catch (error) {
      this.logger.error(`Error in ClerkAuthGuard: ${error.message}`);
      throw new ForbiddenException('Unauthorized');
    }
  }
}
