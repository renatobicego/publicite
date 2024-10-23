import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { clerkClient } from '@clerk/clerk-sdk-node'; 

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request;

    try {
      const contextType = context.getType<string>();

      if (contextType === 'http') {
        request = context.switchToHttp().getRequest();
      } else if (contextType === 'graphql') {
        const gqlContext = GqlExecutionContext.create(context);
        request = gqlContext.getContext().req;
      } else {
        throw new ForbiddenException('Unsupported context type');
      }

      if (!request || !request.cookies) {
        this.logger.error('Cookies or request not found');
        throw new ForbiddenException('Unauthorized');
      }

      const token =
        request.cookies.__session ||
        request.headers.authorization?.split(' ')[1];
      if (!token) {
        this.logger.error('Token not found');
        throw new ForbiddenException('Unauthorized');
      }

      request.token = token;
      await clerkClient.verifyToken(token);

      return true;
    } catch (error) {
      this.logger.error(`Error in ClerkAuthGuard: ${error.message}`);
      throw new ForbiddenException('Unauthorized');
    }
  }
}

