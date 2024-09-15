import { clerkClient } from '@clerk/clerk-sdk-node';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger();
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    try {
      const token = request.cookies?.__session;
      if (!token) {
        this.logger.error('Token not found');
        throw new ForbiddenException('Token not found');
      }

      await clerkClient.verifyToken(token);

      return true;
    } catch (error: any) {
      this.logger.error(`Error in ClerkAuthGuard: ${error.message}`);
      throw error;
    }
  }
}
