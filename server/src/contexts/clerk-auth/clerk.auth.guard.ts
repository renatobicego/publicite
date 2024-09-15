import { clerkClient } from '@clerk/clerk-sdk-node';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger();
  async canActivate(context: ExecutionContext) {
    //Debemos chequear la cookie de Clerk para saber si el usuario es un usuario de la aplicación.
    const request = context.switchToHttp().getRequest(); // obtenemos la request
    const token = request.cookies.__session;
    if (!token) {
      this.logger.error(
        'Token not found, if you have an account please log in, if you are logged in please contact support - CODE:401',
      );
      return false;
    }
    try {
      await clerkClient.verifyToken(token);
    } catch (error: any) {
      this.logger.error('Token is not valid');
      this.logger.error(error);
      return false;
    }

    return true;
  }
}
