import { decodeJwt } from '@clerk/backend/jwt';
import { UnauthorizedException } from '@nestjs/common';

interface JwtPayload {
  metadata: {
    mongoId: string;
  };
}

export class PubliciteAuth {
  static getIdFromClerkToken(token: string): string {
    const claims = decodeJwt(token);
    const payload = claims.payload as unknown as JwtPayload;
    const mongoId = payload.metadata.mongoId;
    return mongoId;
  }
  static authorize(context: any, user: string, type?: string): boolean {
    let token;
    if (type === 'http') {
      const tokenWithOutBearer = context.headers.authorization.split(' ')[1];
      token = tokenWithOutBearer;
    } else {
      token = context.req.headers.authorization;
    }

    if (!token) {
      throw new UnauthorizedException('Token not found in request');
    }

    const mongoId = this.getIdFromClerkToken(token);
    if (user !== mongoId) {
      throw new UnauthorizedException('You not have access to this resource');
    }

    return true;
  }
}
