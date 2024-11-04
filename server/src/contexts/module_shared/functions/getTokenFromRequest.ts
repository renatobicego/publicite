import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { decodeJwt } from '@clerk/backend/jwt';


interface JwtPayload {
  metadata: {
    mongoId: string;
  };
}


function getTokenFromRequest(context: ExecutionContext) {
  let request;
  let token;
  try {
    const contextType = context.getType<string>();

    if (contextType === 'http') {
      request = context.switchToHttp().getRequest();
      //Con el split dividimos la cadena y hacemos 2 arrays y con el 1 accedemos a la posicion 1 que es la del token
      const tokenWithOutBearer = request.headers['authorization'].split(' ')[1];
      token = tokenWithOutBearer;
    } else if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
      token = request.headers['authorization'];
    } else {
      throw new ForbiddenException('Unsupported context type');
    }

    if (!request) {
      this.logger.error('Cookies or request not found');
      throw new ForbiddenException('Unauthorized');
    }

    return token;
  } catch (error: any) {
    throw error;
  }
}


function getIdFromClerkToken(token: string): string {
  const claims = decodeJwt(token);
  const payload = claims.payload as unknown as JwtPayload;
  const mongoId = payload.metadata.mongoId;
  return mongoId;
}

export { getTokenFromRequest, getIdFromClerkToken };