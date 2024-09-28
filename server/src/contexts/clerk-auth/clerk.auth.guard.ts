import { clerkClient } from '@clerk/clerk-sdk-node';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { error } from 'console';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req } = context.switchToHttp().getRequest();
    try {
      if (!req || !req.cookies) {
        this.logger.error('Cookies or request not found');
        throw error;
      }

      const token = req.cookies?.__session;
      if (!token) {
        this.logger.error('Token not found');
        throw error;
      }

      // Verificar el token usando Clerk
      await clerkClient.verifyToken(token);

      return true;
    } catch (error) {
      this.logger.error(`Error in ClerkAuthGuard: ${error.message}`);
      throw new ForbiddenException('Unauthorized');
    }
  }
}
