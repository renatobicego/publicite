import { Logger, UnauthorizedException } from '@nestjs/common';

function checkResultModificationOfOperation(result: any, message?: string) {
  if (!result || result == null) {
    Logger.error(
      message ??
      'User not allowed.',
    );
    throw new UnauthorizedException(
      message ??
      'User not allowed.',
    );
  }

  if (result.matchedCount === 0 || !result) {
    Logger.error(
      message ??
      'User not allowed.',
    );
    throw new UnauthorizedException(
      message ??
      'User not allowed.',
    );
  }
}

export { checkResultModificationOfOperation };
