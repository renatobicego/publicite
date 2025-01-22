import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { verifyToken } from '@clerk/express';

import {
  getIdFromClerkToken,
  getTokenFromRequest,
} from '../../utils/functions/getTokenFromRequest';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let token;
    let request;

    try {
      token = getTokenFromRequest(context as any);
      if (!token) {
        this.logger.error('Token not found');
        throw new ForbiddenException('Unauthorized');
      }
      if (token === process.env.USER_NOT_REGISTERED_KEY) {
        this.makeBodyRequestForNotRegisteredUser(context);
        return true;
      }
      await verifyToken(token.toString(), {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      if (context.getType() === 'http') {
        this.logger.warn('Http request in process');
        request = context.switchToHttp().getRequest();
        request.userRequestId = getIdFromClerkToken(token);
        request.isUserRegister = true;
      } else if (context.getType() === ('graphql' as any)) {
        this.logger.warn('graphql request in process');
        const gqlContext = GqlExecutionContext.create(context);
        request = gqlContext.getContext().req;
        const userRequestId = getIdFromClerkToken(token);
        request.isUserRegister = true;
        request.userRequestId = userRequestId;
      } else {
        throw new ForbiddenException('Unsupported request type');
      }

      return true;
    } catch (error) {
      this.logger.error(`Error in ClerkAuthGuard: ${error.message}`);
      throw new ForbiddenException('Unauthorized');
    }
  }

  makeBodyRequestForNotRegisteredUser(context: ExecutionContext) {
    let request;
    if (context.getType() === 'http') {
      this.logger.warn('Http request in process');
      request = context.switchToHttp().getRequest();
      request.isUserRegister = false;
    } else if (context.getType() === ('graphql' as any)) {
      this.logger.warn('graphql request in process');
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
      request.isUserRegister = false;
    } else {
      throw new ForbiddenException('Unsupported request type');
    }
  }
}
