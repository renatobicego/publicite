import {

  ExecutionContext,
  ForbiddenException,

} from '@nestjs/common';



import { decodeJwt } from '@clerk/backend/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';


interface JwtPayload {
  metadata: {
    mongoId: string;
  };
}





function getTokenFromRequest(context: any) {
  let request;
  let token;
  try {

    const contextType = context.getType();
    if (contextType === 'http') {
      request = context.switchToHttp().getRequest();
      if (!request.headers['authorization']) {
        throw new ForbiddenException('No auth header, Unauthorized');
      }
      //Con el split dividimos la cadena y hacemos 2 arrays y con el 1 accedemos a la posicion 1 que es la del token
      const tokenWithOutBearer = request.headers['authorization'].split(' ')[1];
      token = tokenWithOutBearer;
    } else if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context as any);
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