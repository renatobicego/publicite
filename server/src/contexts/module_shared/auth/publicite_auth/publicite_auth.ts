
import { UnauthorizedException } from '@nestjs/common';
import { getIdFromClerkToken } from '../../functions/getTokenFromRequest';


export class PubliciteAuth {

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
    const mongoId = getIdFromClerkToken(token);
    if (user !== mongoId) {
      throw new UnauthorizedException('You not have access to this resource');
    }

    return true;
  }
}
