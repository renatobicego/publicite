import { decodeJwt } from '@clerk/backend/jwt';
import { UnauthorizedException } from '@nestjs/common';

interface JwtPayload {
  metadata: {
    mongoId: string;
  };
}

export class PubliciteAuth {
  static authorize(context: any, user: string): boolean {
    const token = context.req.token;
    if (!token) {
      throw new UnauthorizedException('Token not found in request');
    }
    const claims = decodeJwt(token);
    const payload = claims.payload as unknown as JwtPayload;
    const mongoId = payload.metadata.mongoId;
    if (user !== mongoId) {
      throw new UnauthorizedException('You not have access to this resource');
    }
    return true;
  }
}
