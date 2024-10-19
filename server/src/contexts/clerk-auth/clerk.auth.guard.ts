import { clerkClient } from '@clerk/clerk-sdk-node';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //const httpContext = context.switchToHttp();
    //let request = httpContext.getRequest();

    // const authToken = request.headers.authorization;
    // console.log(authToken.substring(7).trim());
/* 
    try {
      if (context.getType() === 'http') {
        request = context.switchToHttp().getRequest();
      } else {
        const gqlContext = GqlExecutionContext.create(context);
        request = gqlContext.getContext().req;
      }

      if (!request || !request.cookies) {
        this.logger.error('Cookies or request not found');
        throw new ForbiddenException('Unauthorized');
      }

      const token = request.cookies.__session;
      if (!token) {
        this.logger.error('Token not found');
        throw new ForbiddenException('Unauthorized');
      }

      request.token = token;
      await clerkClient.verifyToken(token);
*/
      return true;
    } catch (error) {
      this.logger.error(`Error in ClerkAuthGuard: ${error.message}`);
      throw new ForbiddenException('Unauthorized');
    }
  }
}
