
import { UnauthorizedException } from '@nestjs/common';
import { getIdFromClerkToken } from '../../functions/getTokenFromRequest';


export class PubliciteAuth {

  static authorize(mongoIdFromContext: any, user: string): boolean {
    if (user !== mongoIdFromContext) {
      throw new UnauthorizedException('You not have access to this resource');
    }

    return true;
  }
}
